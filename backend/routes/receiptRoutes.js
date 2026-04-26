const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  scanReceipt,
  getAllReceipts,
  getReceiptById,
  deleteReceipt,
  askAI,
  getRecipes,
} = require('../controllers/receiptController');
const Product = require('../models/Product');
const { scanProductWithAI, scanProductFromBase64 } = require('../services/aiService');

// Receipts
router.post('/scan', upload.single('receipt'), scanReceipt);
router.get('/', getAllReceipts);
router.get('/:id', getReceiptById);
router.delete('/:id', deleteReceipt);

// AI endpoints (montate aici dar pot fi mutate în aiRoutes.js)
router.post('/ai/ask', askAI);
router.get('/ai/recipes', getRecipes);

// POST /api/receipts/scan-product — Scanează un produs individual
router.post('/scan-product', upload.single('receipt'), async (req, res) => {
  try {
    let aiResult = null;

    if (req.file) {
      aiResult = await scanProductWithAI(req.file.path);
    } else if (req.body.image) {
      const mimeType = req.body.mimeType || 'image/jpeg';
      aiResult = await scanProductFromBase64(req.body.image, mimeType);
    } else {
      return res.status(400).json({ error: 'Trimite o imagine cu produsul.' });
    }

    if (!aiResult || !aiResult.success) {
      return res.status(422).json({ error: 'Nu am putut identifica produsul', details: aiResult?.error });
    }

    // Fix Romanian format: 1.000 buc = 1 bucată
    let qty = aiResult.product.quantity || 1;
    const unit = aiResult.product.unit || 'buc';
    if (unit === 'buc' && qty >= 100) qty = Math.round(qty / 1000) || 1;
    if (unit === 'buc' && qty > 50) qty = 1;
    const expiryDate = req.body.expiryDate || null;

    const product = new Product({
      name: aiResult.product.name,
      category: aiResult.product.category,
      quantity: qty,
      unit: unit,
      price: aiResult.product.price,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      addedDate: new Date(),
      user: req.userId,
    });

    const saved = await product.save();

    res.status(201).json({
      message: `Produs identificat: ${saved.name}`,
      product: { ...saved.toObject(), brand: aiResult.product.brand, description: aiResult.product.description },
    });
  } catch (error) {
    console.error('❌ Eroare scanare produs:', error.message);
    res.status(500).json({ error: 'Eroare', details: error.message });
  }
});

module.exports = router;

