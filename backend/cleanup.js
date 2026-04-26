// Script de cleanup — șterge toate datele fără user din MongoDB
require('dotenv').config();
const mongoose = require('mongoose');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sigkill';

async function cleanup() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Conectat la MongoDB');

  const Product = require('./models/Product');
  const Bill = require('./models/Bill');
  const Receipt = require('./models/Receipt');
  const Budget = require('./models/Budget');

  // Șterge toate datele fără user (null sau inexistent)
  const p1 = await Product.deleteMany({ $or: [{ user: null }, { user: { $exists: false } }] });
  const b1 = await Bill.deleteMany({ $or: [{ user: null }, { user: { $exists: false } }] });
  const r1 = await Receipt.deleteMany({ $or: [{ user: null }, { user: { $exists: false } }] });
  const bg1 = await Budget.deleteMany({ $or: [{ user: null }, { user: { $exists: false } }] });

  console.log(`🗑️ Produse șterse: ${p1.deletedCount}`);
  console.log(`🗑️ Facturi șterse: ${b1.deletedCount}`);
  console.log(`🗑️ Bonuri șterse: ${r1.deletedCount}`);
  console.log(`🗑️ Bugete șterse: ${bg1.deletedCount}`);
  console.log('✅ Cleanup complet! Datele vechi au fost șterse.');

  await mongoose.disconnect();
  process.exit(0);
}

cleanup().catch(e => { console.error('❌ Eroare:', e.message); process.exit(1); });
