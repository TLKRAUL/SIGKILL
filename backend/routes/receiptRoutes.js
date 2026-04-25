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

// Receipts
router.post('/scan', upload.single('receipt'), scanReceipt);
router.get('/', getAllReceipts);
router.get('/:id', getReceiptById);
router.delete('/:id', deleteReceipt);

// AI endpoints (montate aici dar pot fi mutate în aiRoutes.js)
router.post('/ai/ask', askAI);
router.get('/ai/recipes', getRecipes);

module.exports = router;
