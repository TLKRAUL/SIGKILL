const Product = require('../models/Product');

function isDbConnected() {
  const mongoose = require('mongoose');
  return mongoose.connection.readyState === 1;
}

// GET /api/pantry — Toate produsele din cămară (per user)
const getAllProducts = async (req, res) => {
  try {
    const userId = req.userId;
    const { category, search, sort, expired } = req.query;
    let query = { isConsumed: false, user: userId };
    if (category && category !== 'all') query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    if (expired === 'true') query.expiryDate = { $lt: new Date() };

    let sortOption = { expiryDate: 1 };
    if (sort === 'name') sortOption = { name: 1 };
    if (sort === 'added') sortOption = { addedDate: -1 };
    if (sort === 'category') sortOption = { category: 1 };

    const products = await Product.find(query).sort(sortOption);
    console.log(`📦 GET /pantry → userId: ${userId}, query:`, JSON.stringify(query), `→ found ${products.length} products`);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Eroare la obținerea produselor', details: error.message });
  }
};

// GET /api/pantry/:id — Un singur produs
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, user: req.userId });
    if (!product) return res.status(404).json({ error: 'Produsul nu a fost găsit' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Eroare', details: error.message });
  }
};

// POST /api/pantry — Adaugă un produs (cu stacking automat, per user)
const createProduct = async (req, res) => {
  try {
    const { name, category, quantity, unit, price, expiryDate } = req.body;
    if (!name) return res.status(400).json({ error: 'Numele produsului este obligatoriu' });

    const userId = req.userId;

    // Stacking: caută produs cu același nume și dată expirare similară
    const normalizedName = name.trim().toLowerCase();
    const existingProducts = await Product.find({ isConsumed: false, user: userId });
    const match = existingProducts.find(p => {
      if (p.name.trim().toLowerCase() !== normalizedName) return false;
      const u1 = (unit || 'buc').toLowerCase();
      const u2 = (p.unit || 'buc').toLowerCase();
      const compatible = u1 === u2 || 
        (u1 === 'g' && u2 === 'kg') || (u1 === 'kg' && u2 === 'g') ||
        (u1 === 'ml' && u2 === 'l') || (u1 === 'l' && u2 === 'ml');
      if (!compatible) return false;
      if (expiryDate && p.expiryDate) {
        const diff = Math.abs(new Date(expiryDate) - new Date(p.expiryDate)) / 86400000;
        return diff <= 1;
      }
      if (!expiryDate && !p.expiryDate) return true;
      return false;
    });

    if (match) {
      let addQty = quantity || 1;
      const u1 = (unit || 'buc').toLowerCase();
      const u2 = (match.unit || 'buc').toLowerCase();
      if (u1 === 'g' && u2 === 'kg') addQty = addQty / 1000;
      else if (u1 === 'kg' && u2 === 'g') addQty = addQty * 1000;
      else if (u1 === 'ml' && u2 === 'l') addQty = addQty / 1000;
      else if (u1 === 'l' && u2 === 'ml') addQty = addQty * 1000;

      match.quantity = Math.round(((match.quantity || 0) + addQty) * 1000) / 1000;
      if (price) match.price = (match.price || 0) + price;
      await match.save();
      console.log(`📦 Stacked: ${match.name} → ${match.quantity} ${match.unit}`);
      return res.status(200).json(match);
    }

    const product = new Product({ name, category: category || 'Altele', quantity: quantity || 1, unit: unit || 'buc', price: price || 0, expiryDate: expiryDate || null, addedDate: new Date(), user: userId });
    const saved = await product.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: 'Eroare la adăugare', details: error.message });
  }
};

// POST /api/pantry/bulk — Adaugă mai multe produse (de la bon, per user)
const createManyProducts = async (req, res) => {
  try {
    const { products } = req.body;
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: 'Lista de produse este goală' });
    }

    const userId = req.userId;
    const toInsert = products.map(p => ({
      name: p.name, category: p.category || 'Altele', quantity: p.quantity || 1,
      unit: p.unit || 'buc', price: p.price || 0, expiryDate: p.expiryDate || null, addedDate: new Date(),
      user: userId,
    }));
    const saved = await Product.insertMany(toInsert);
    res.status(201).json({ message: `${saved.length} produse adăugate cu succes`, products: saved });
  } catch (error) {
    res.status(400).json({ error: 'Eroare', details: error.message });
  }
};

// PUT /api/pantry/:id — Actualizează un produs (per user)
const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Produsul nu a fost găsit' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: 'Eroare', details: error.message });
  }
};

// DELETE /api/pantry/:id — Șterge un produs (per user)
const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!deleted) return res.status(404).json({ error: 'Produsul nu a fost găsit' });
    res.json({ message: 'Produs șters cu succes', product: deleted });
  } catch (error) {
    res.status(500).json({ error: 'Eroare', details: error.message });
  }
};

// GET /api/pantry/stats/summary — Statistici cămară (per user)
const getStats = async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 86400000);
    const [total, expiring, expired, categories] = await Promise.all([
      Product.countDocuments({ isConsumed: false, user: userId }),
      Product.countDocuments({ isConsumed: false, user: userId, expiryDate: { $gte: now, $lte: threeDaysLater } }),
      Product.countDocuments({ isConsumed: false, user: userId, expiryDate: { $lt: now, $ne: null } }),
      Product.distinct('category', { isConsumed: false, user: userId }),
    ]);
    res.json({ totalProducts: total, expiringProducts: expiring, expiredProducts: expired, categoriesCount: categories.length, categories });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la statistici', details: error.message });
  }
};

// POST /api/pantry/use-recipe — Scade ingredientele unei rețete din cămară (per user)
const useRecipe = async (req, res) => {
  try {
    const { ingredients } = req.body;
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: 'Lista de ingrediente este goală' });
    }

    const pantryItems = await Product.find({ isConsumed: false, user: req.userId });
    const results = [];

    for (const ingredient of ingredients) {
      const ingLower = (typeof ingredient === 'string' ? ingredient : ingredient.name || '').toLowerCase();
      
      const match = pantryItems.find(p => {
        const pName = p.name.toLowerCase();
        return pName.includes(ingLower.split(/\s+/)[0]) || ingLower.includes(pName.split(/\s+/)[0]);
      });

      if (match) {
        const qtyMatch = ingLower.match(/(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l|buc)?/i);
        let deductQty = qtyMatch ? parseFloat(qtyMatch[1].replace(',', '.')) : 1;
        const deductUnit = qtyMatch?.[2]?.toLowerCase() || '';

        if (match.unit === 'kg' && (deductUnit === 'g' || !deductUnit)) deductQty = deductQty / 1000;
        if (match.unit === 'L' && deductUnit === 'ml') deductQty = deductQty / 1000;
        if (match.unit === 'g' && deductUnit === 'kg') deductQty = deductQty * 1000;

        const newQty = match.quantity - deductQty;
        if (newQty <= 0) {
          await Product.findByIdAndDelete(match._id);
          results.push({ name: match.name, action: 'deleted', message: `${match.name} consumat complet` });
        } else {
          match.quantity = Math.round(newQty * 1000) / 1000;
          await match.save();
          results.push({ name: match.name, action: 'reduced', remaining: match.quantity, unit: match.unit });
        }
      } else {
        results.push({ name: ingredient, action: 'not_found', message: 'Nu a fost găsit în cămară' });
      }
    }

    res.json({ message: 'Ingrediente actualizate!', results });
  } catch (error) {
    res.status(500).json({ error: 'Eroare la actualizarea ingredientelor', details: error.message });
  }
};

module.exports = { getAllProducts, getProductById, createProduct, createManyProducts, updateProduct, deleteProduct, getStats, useRecipe };
