const Product = require('../models/Product');

// Date demo pentru fallback (fără MongoDB)
const DEMO_PRODUCTS = [
  { id: '1', _id: '1', name: 'Lapte Zuzu 1L', category: 'Lactate', quantity: 2, unit: 'buc', price: 7.99, expiryDate: new Date(Date.now() + 3 * 86400000).toISOString(), addedDate: new Date().toISOString(), isConsumed: false },
  { id: '2', _id: '2', name: 'Piept de Pui', category: 'Carne', quantity: 500, unit: 'g', price: 24.99, expiryDate: new Date(Date.now() + 2 * 86400000).toISOString(), addedDate: new Date().toISOString(), isConsumed: false },
  { id: '3', _id: '3', name: 'Mere Golden', category: 'Fructe', quantity: 6, unit: 'buc', price: 12.50, expiryDate: new Date(Date.now() + 8 * 86400000).toISOString(), addedDate: new Date().toISOString(), isConsumed: false },
  { id: '4', _id: '4', name: 'Iaurt Grecesc', category: 'Lactate', quantity: 3, unit: 'buc', price: 5.49, expiryDate: new Date(Date.now() + 4 * 86400000).toISOString(), addedDate: new Date().toISOString(), isConsumed: false },
  { id: '5', _id: '5', name: 'Ciocolată Milka', category: 'Dulciuri', quantity: 1, unit: 'buc', price: 8.99, expiryDate: new Date(Date.now() + 120 * 86400000).toISOString(), addedDate: new Date().toISOString(), isConsumed: false },
  { id: '6', _id: '6', name: 'Roșii Cherry', category: 'Legume', quantity: 300, unit: 'g', price: 9.99, expiryDate: new Date(Date.now() + 5 * 86400000).toISOString(), addedDate: new Date().toISOString(), isConsumed: false },
  { id: '7', _id: '7', name: 'Pâine Integrală', category: 'Panificație', quantity: 1, unit: 'buc', price: 4.50, expiryDate: new Date(Date.now() + 2 * 86400000).toISOString(), addedDate: new Date().toISOString(), isConsumed: false },
  { id: '8', _id: '8', name: 'Suc Natural Portocale', category: 'Băuturi', quantity: 1, unit: 'L', price: 11.99, expiryDate: new Date(Date.now() + 7 * 86400000).toISOString(), addedDate: new Date().toISOString(), isConsumed: false },
];

function isDbConnected() {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1;
}

// GET /api/pantry — Toate produsele din cămară
const getAllProducts = async (req, res) => {
  try {
    if (!isDbConnected()) {
      // Returnează date demo
      let result = [...DEMO_PRODUCTS];
      const { category, search, sort } = req.query;
      if (category && category !== 'all') result = result.filter(p => p.category === category);
      if (search) result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
      if (sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
      else if (sort === 'added') result.sort((a, b) => new Date(b.addedDate) - new Date(a.addedDate));
      else result.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
      return res.json(result);
    }

    const { category, search, sort, expired } = req.query;
    let query = { isConsumed: false };
    if (category && category !== 'all') query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    if (expired === 'true') query.expiryDate = { $lt: new Date() };

    let sortOption = { expiryDate: 1 };
    if (sort === 'name') sortOption = { name: 1 };
    if (sort === 'added') sortOption = { addedDate: -1 };
    if (sort === 'category') sortOption = { category: 1 };

    const products = await Product.find(query).sort(sortOption);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea produselor', details: error.message });
  }
};

// GET /api/pantry/:id — Un singur produs
const getProductById = async (req, res) => {
  try {
    if (!isDbConnected()) {
      const item = DEMO_PRODUCTS.find(p => p.id === req.params.id);
      return item ? res.json(item) : res.status(404).json({ error: 'Produsul nu a fost găsit' });
    }
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Produsul nu a fost găsit' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Eroare', details: error.message });
  }
};

// POST /api/pantry — Adaugă un produs
const createProduct = async (req, res) => {
  try {
    const { name, category, quantity, unit, price, expiryDate } = req.body;
    if (!name) return res.status(400).json({ error: 'Numele produsului este obligatoriu' });

    if (!isDbConnected()) {
      const newProduct = { id: String(Date.now()), _id: String(Date.now()), name, category: category || 'Altele', quantity: quantity || 1, unit: unit || 'buc', price: price || 0, expiryDate, addedDate: new Date().toISOString(), isConsumed: false };
      DEMO_PRODUCTS.push(newProduct);
      return res.status(201).json(newProduct);
    }

    const product = new Product({ name, category: category || 'Altele', quantity: quantity || 1, unit: unit || 'buc', price: price || 0, expiryDate: expiryDate || null, addedDate: new Date() });
    const saved = await product.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: 'Eroare la adăugare', details: error.message });
  }
};

// POST /api/pantry/bulk — Adaugă mai multe produse (de la bon)
const createManyProducts = async (req, res) => {
  try {
    const { products } = req.body;
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Lista de produse este goală' });
    }

    if (!isDbConnected()) {
      const newProducts = products.map(p => ({
        id: String(Date.now() + Math.random()), _id: String(Date.now() + Math.random()),
        name: p.name, category: p.category || 'Altele', quantity: p.quantity || 1,
        unit: p.unit || 'buc', price: p.price || 0, expiryDate: p.expiryDate || null,
        addedDate: new Date().toISOString(), isConsumed: false,
      }));
      DEMO_PRODUCTS.push(...newProducts);
      return res.status(201).json({ message: `${newProducts.length} produse adăugate`, products: newProducts });
    }

    const toInsert = products.map(p => ({
      name: p.name, category: p.category || 'Altele', quantity: p.quantity || 1,
      unit: p.unit || 'buc', price: p.price || 0, expiryDate: p.expiryDate || null, addedDate: new Date(),
    }));
    const saved = await Product.insertMany(toInsert);
    res.status(201).json({ message: `${saved.length} produse adăugate cu succes`, products: saved });
  } catch (error) {
    res.status(400).json({ error: 'Eroare', details: error.message });
  }
};

// PUT /api/pantry/:id — Actualizează un produs
const updateProduct = async (req, res) => {
  try {
    if (!isDbConnected()) {
      const idx = DEMO_PRODUCTS.findIndex(p => p.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: 'Produsul nu a fost găsit' });
      DEMO_PRODUCTS[idx] = { ...DEMO_PRODUCTS[idx], ...req.body };
      return res.json(DEMO_PRODUCTS[idx]);
    }
    const updated = await Product.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ error: 'Produsul nu a fost găsit' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: 'Eroare', details: error.message });
  }
};

// DELETE /api/pantry/:id — Șterge un produs
const deleteProduct = async (req, res) => {
  try {
    if (!isDbConnected()) {
      const idx = DEMO_PRODUCTS.findIndex(p => p.id === req.params.id);
      if (idx === -1) return res.status(404).json({ error: 'Produsul nu a fost găsit' });
      const deleted = DEMO_PRODUCTS.splice(idx, 1)[0];
      return res.json({ message: 'Produs șters cu succes', product: deleted });
    }
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Produsul nu a fost găsit' });
    res.json({ message: 'Produs șters cu succes', product: deleted });
  } catch (error) {
    res.status(500).json({ error: 'Eroare', details: error.message });
  }
};

// GET /api/pantry/stats/summary — Statistici cămară
const getStats = async (req, res) => {
  try {
    if (!isDbConnected()) {
      const now = new Date();
      const items = DEMO_PRODUCTS.filter(p => !p.isConsumed);
      const expiring = items.filter(p => {
        if (!p.expiryDate) return false;
        const days = Math.ceil((new Date(p.expiryDate) - now) / 86400000);
        return days >= 0 && days <= 3;
      }).length;
      const expired = items.filter(p => p.expiryDate && new Date(p.expiryDate) < now).length;
      const categories = [...new Set(items.map(p => p.category))];
      return res.json({ totalProducts: items.length, expiringProducts: expiring, expiredProducts: expired, categoriesCount: categories.length, categories });
    }

    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 86400000);
    const [total, expiring, expired, categories] = await Promise.all([
      Product.countDocuments({ isConsumed: false }),
      Product.countDocuments({ isConsumed: false, expiryDate: { $gte: now, $lte: threeDaysLater } }),
      Product.countDocuments({ isConsumed: false, expiryDate: { $lt: now, $ne: null } }),
      Product.distinct('category', { isConsumed: false }),
    ]);
    res.json({ totalProducts: total, expiringProducts: expiring, expiredProducts: expired, categoriesCount: categories.length, categories });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la statistici', details: error.message });
  }
};

module.exports = { getAllProducts, getProductById, createProduct, createManyProducts, updateProduct, deleteProduct, getStats };
