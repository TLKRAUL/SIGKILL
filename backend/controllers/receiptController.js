const Receipt = require('../models/Receipt');
const Product = require('../models/Product');
const { 
  scanReceiptWithAI, 
  scanReceiptFromBase64, 
  askGemini, 
  getRecipesFromGemini, 
  detectCategoryFallback 
} = require('../services/aiService');

// POST /api/receipts/scan — Scanează un bon (upload imagine sau base64)
const scanReceipt = async (req, res) => {
  try {
    let aiResult = null;

    // Opțiunea 1: Upload fișier imagine (multer)
    if (req.file) {
      console.log('📸 Procesare imagine bon:', req.file.originalname);
      aiResult = await scanReceiptWithAI(req.file.path);
    }
    // Opțiunea 2: Base64 image din frontend
    else if (req.body.image) {
      console.log('📸 Procesare imagine base64');
      const mimeType = req.body.mimeType || 'image/jpeg';
      aiResult = await scanReceiptFromBase64(req.body.image, mimeType);
    }
    // Opțiunea 3: Text direct (manual/test)
    else if (req.body.text) {
      console.log('📝 Procesare text bon');
      // Parsare simplă linie cu linie
      const lines = req.body.text.split('\n').filter(l => l.trim());
      const products = lines.map(line => {
        const trimmed = line.trim();
        const priceMatch = trimmed.match(/(\d+[\.,]\d{2})\s*$/);
        const price = priceMatch ? parseFloat(priceMatch[1].replace(',', '.')) : 0;
        const name = priceMatch ? trimmed.replace(priceMatch[0], '').trim() : trimmed;
        return {
          name,
          quantity: 1,
          unit: 'buc',
          price,
          category: detectCategoryFallback(name),
        };
      }).filter(p => p.name.length > 2);

      aiResult = {
        success: true,
        storeName: req.body.storeName || 'Necunoscut',
        totalAmount: products.reduce((s, p) => s + p.price, 0),
        products,
      };
    }
    else {
      return res.status(400).json({ error: 'Trimite o imagine (fișier sau base64) sau text cu bonul.' });
    }

    // Dacă AI-ul a eșuat
    if (!aiResult || !aiResult.success) {
      return res.status(422).json({ 
        error: 'Nu am putut procesa bonul', 
        details: aiResult?.error || 'Eroare necunoscută',
        hint: 'Verifică că GEMINI_API_KEY e setat în .env'
      });
    }

    // Salvează bonul în DB
    const receipt = new Receipt({
      storeName: aiResult.storeName,
      totalAmount: aiResult.totalAmount,
      items: aiResult.products,
      imageUrl: req.file ? req.file.path : null,
      rawText: req.body.text || '',
      processed: true,
    });
    const savedReceipt = await receipt.save();

    // Adaugă produsele în cămară
    const pantryProducts = aiResult.products.map(p => ({
      name: p.name,
      category: p.category,
      quantity: p.quantity,
      unit: p.unit,
      price: p.price,
      receipt: savedReceipt._id,
      addedDate: new Date(),
      // Estimează data expirării (7 zile default, 3 pentru lactate/carne)
      expiryDate: getDefaultExpiry(p.category),
    }));

    const savedProducts = await Product.insertMany(pantryProducts);

    console.log(`✅ Bon procesat: ${savedProducts.length} produse de la ${aiResult.storeName}`);

    res.status(201).json({
      message: `Bon procesat cu succes! ${savedProducts.length} produse adăugate.`,
      receipt: savedReceipt,
      products: savedProducts,
    });
  } catch (error) {
    console.error('❌ Eroare scanare bon:', error);
    res.status(500).json({ error: 'Eroare la procesarea bonului', details: error.message });
  }
};

// Helper: estimare dată expirare pe baza categoriei
function getDefaultExpiry(category) {
  const now = new Date();
  const daysMap = {
    'Lactate': 5,
    'Carne': 3,
    'Fructe': 7,
    'Legume': 7,
    'Panificație': 3,
    'Băuturi': 30,
    'Conserve': 365,
    'Condimente': 180,
    'Dulciuri': 60,
    'Altele': 14,
  };
  const days = daysMap[category] || 14;
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}

// GET /api/receipts — Toate bonurile
const getAllReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find().sort({ scanDate: -1 });
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea bonurilor', details: error.message });
  }
};

// GET /api/receipts/:id — Un bon specific
const getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) return res.status(404).json({ error: 'Bonul nu a fost găsit' });
    res.json(receipt);
  } catch (error) {
    res.status(500).json({ error: 'Eroare', details: error.message });
  }
};

// DELETE /api/receipts/:id — Șterge un bon
const deleteReceipt = async (req, res) => {
  try {
    const deleted = await Receipt.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Bonul nu a fost găsit' });
    // Șterge și produsele asociate
    await Product.deleteMany({ receipt: req.params.id });
    res.json({ message: 'Bon și produse asociate șterse cu succes' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare', details: error.message });
  }
};

// POST /api/ai/ask — Chat cu AI
const askAI = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Mesajul este obligatoriu' });

    const pantryItems = await Product.find({ isConsumed: false });
    const response = await askGemini(message, pantryItems);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Eroare AI', details: error.message });
  }
};

// GET /api/ai/recipes — Sugestii de rețete
const getRecipes = async (req, res) => {
  try {
    const pantryItems = await Product.find({ isConsumed: false });
    const recipes = await getRecipesFromGemini(pantryItems);
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: 'Eroare rețete', details: error.message });
  }
};

module.exports = {
  scanReceipt,
  getAllReceipts,
  getReceiptById,
  deleteReceipt,
  askAI,
  getRecipes,
};
