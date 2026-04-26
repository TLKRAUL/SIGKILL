const Receipt = require('../models/Receipt');
const Product = require('../models/Product');
const { 
  scanReceiptWithAI, 
  scanReceiptFromBase64, 
  askGemini, 
  getRecipesFromGemini, 
  detectCategoryFallback,
  estimateExpiryDays,
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
      const errMsg = aiResult?.error || 'Eroare necunoscută';
      const isRateLimit = errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('Too Many Requests');
      return res.status(isRateLimit ? 429 : 422).json({ 
        error: isRateLimit 
          ? 'Prea multe cereri. Așteaptă câteva secunde și încearcă din nou.'
          : 'Nu am putut procesa bonul', 
        details: errMsg,
        hint: isRateLimit 
          ? 'Limita de cereri Claude a fost atinsă. Reîncearcă în 30-60 secunde.'
          : 'Verifică că imaginea e clară și conține un bon/produs/factură vizibil.'
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
      user: req.userId,
    });
    const savedReceipt = await receipt.save();

    // AI estimare expirare pentru fiecare produs
    console.log('🧠 AI estimează datele de expirare...');
    let expiryEstimates;
    try {
      expiryEstimates = await estimateExpiryDays(aiResult.products);
    } catch {
      expiryEstimates = aiResult.products.map(p => ({ name: p.name, days: getDefaultExpiry(p.category, true) }));
    }

    const now = new Date();
    const pantryProducts = aiResult.products.map((p, i) => {
      const estimate = expiryEstimates?.find(e => e.name?.toLowerCase() === p.name?.toLowerCase()) || expiryEstimates?.[i];
      const days = estimate?.days || getDefaultExpiry(p.category, true);
      // Fix Romanian format: 1.000 buc = 1 bucată
      let qty = p.quantity || 1;
      if (p.unit === 'buc' && qty >= 100) qty = Math.round(qty / 1000) || 1;
      if (p.unit === 'buc' && qty > 50) qty = 1;
      return {
        name: p.name, category: p.category, quantity: qty, unit: p.unit, price: p.price,
        receipt: savedReceipt._id, addedDate: now, user: req.userId,
        expiryDate: new Date(now.getTime() + days * 24 * 60 * 60 * 1000),
      };
    });

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

// Helper fallback: expirare default pe categorie
function getDefaultExpiry(category, returnDays = false) {
  const daysMap = { 'Lactate': 5, 'Carne': 3, 'Fructe': 7, 'Legume': 7, 'Panificație': 3, 'Băuturi': 30, 'Conserve': 365, 'Condimente': 180, 'Dulciuri': 60, 'Altele': 14 };
  const days = daysMap[category] || 14;
  if (returnDays) return days;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

// GET /api/receipts — Toate bonurile
const getAllReceipts = async (req, res) => {
  try {
    const receipts = await Receipt.find({ user: req.userId }).sort({ scanDate: -1 });
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea bonurilor', details: error.message });
  }
};

// GET /api/receipts/:id — Un bon specific
const getReceiptById = async (req, res) => {
  try {
    const receipt = await Receipt.findOne({ _id: req.params.id, user: req.userId });
    if (!receipt) return res.status(404).json({ error: 'Bonul nu a fost găsit' });
    res.json(receipt);
  } catch (error) {
    res.status(500).json({ error: 'Eroare', details: error.message });
  }
};

// DELETE /api/receipts/:id — Șterge un bon
const deleteReceipt = async (req, res) => {
  try {
    const deleted = await Receipt.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!deleted) return res.status(404).json({ error: 'Bonul nu a fost găsit' });
    // Șterge și produsele asociate
    await Product.deleteMany({ receipt: req.params.id });
    res.json({ message: 'Bon și produse asociate șterse cu succes' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare', details: error.message });
  }
};

// POST /api/ai/ask — Chat cu AI (cu suport acțiuni add/delete)
const askAI = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Mesajul este obligatoriu' });

    const pantryItems = await Product.find({ isConsumed: false, user: req.userId });
    const response = await askGemini(message, pantryItems);

    // Dacă AI-ul a returnat acțiuni, le executăm
    if (response.actions && response.actions.length > 0) {
      const results = [];
      for (const action of response.actions) {
        try {
          if (action.type === 'add') {
            const product = new Product({
              name: action.name,
              category: action.category || 'Altele',
              quantity: action.quantity || 1,
              unit: action.unit || 'buc',
              addedDate: new Date(),
              user: req.userId,
              expiryDate: action.expiryDays 
                ? new Date(Date.now() + action.expiryDays * 86400000) 
                : new Date(Date.now() + 14 * 86400000),
            });
            const saved = await product.save();
            results.push({ type: 'add', success: true, product: saved });
            console.log(`✅ AI a adăugat: ${saved.name}`);
          } else if (action.type === 'delete' && action.id) {
            const deleted = await Product.findOneAndDelete({ _id: action.id, user: req.userId });
            if (deleted) {
              results.push({ type: 'delete', success: true, name: deleted.name });
              console.log(`🗑️ AI a șters: ${deleted.name}`);
            } else {
              results.push({ type: 'delete', success: false, error: 'Produs negăsit' });
            }
          }
        } catch (e) {
          results.push({ type: action.type, success: false, error: e.message });
        }
      }
      return res.json({ answer: response.answer, actions: results, pantryChanged: true });
    }

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Eroare AI', details: error.message });
  }
};

// GET /api/ai/recipes — Sugestii de rețete
const getRecipes = async (req, res) => {
  try {
    const pantryItems = await Product.find({ isConsumed: false, user: req.userId });
    const recipes = await getRecipesFromGemini(pantryItems);
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: 'Eroare rețete', details: error.message });
  }
};

// POST /api/ai/meal-plan — Plan alimentar AI
const getMealPlan = async (req, res) => {
  try {
    const { weight, height, age, gender, goal, budget, allergies } = req.body;
    if (!weight || !height || !age) {
      return res.status(400).json({ error: 'Completează greutatea, înălțimea și vârsta.' });
    }
    const pantryItems = await Product.find({ isConsumed: false, user: req.userId }).select('name category');
    const { generateMealPlan } = require('../services/aiService');
    const plan = await generateMealPlan({ weight, height, age, gender, goal, budget, allergies, pantryItems });
    res.json(plan);
  } catch (error) {
    console.error('❌ Eroare meal plan:', error.message);
    res.status(500).json({ error: 'Eroare la generarea planului', details: error.message });
  }
};

module.exports = {
  scanReceipt,
  getAllReceipts,
  getReceiptById,
  deleteReceipt,
  askAI,
  getRecipes,
  getMealPlan,
};
