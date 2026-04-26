require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const productRoutes = require('./routes/productRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const aiRoutes = require('./routes/aiRoutes');
const authRoutes = require('./routes/authRoutes');
const billRoutes = require('./routes/billRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');

const app = express();

// ===== Middleware =====
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ===== MongoDB Connection =====
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sigkill';
let dbConnected = false;

mongoose.connect(MONGO_URI)
  .then(() => {
    dbConnected = true;
    console.log('✅ Conectat la MongoDB');
  })
  .catch(err => {
    dbConnected = false;
    console.error('❌ Eroare MongoDB:', err.message);
    console.log('⚠️  Serverul pornește FĂRĂ bază de date. Rutele vor returna date demo.');
  });

// Middleware: pune dbConnected pe req pentru controllers
app.use((req, res, next) => {
  req.dbConnected = dbConnected;
  next();
});

// ===== Routes =====

// Health check
app.get('/api/test', (req, res) => {
  res.json({
    mesaj: 'Conexiune reușită cu SIGKILL Backend! 🚀',
    database: dbConnected ? 'connected' : 'disconnected',
    ai: process.env.CLAUDE_API_KEY ? 'configured (Claude Haiku)' : 'not configured',
  });
});

// API Routes
app.use('/api/auth', authRoutes);                           // Public (login/register)
app.use('/api/subscription', subscriptionRoutes);           // Has its own auth

// Protected routes — require JWT token
const auth = require('./middleware/auth');
app.use('/api/pantry', auth, productRoutes);
app.use('/api/receipts', auth, receiptRoutes);
app.use('/api/ai', auth, aiRoutes);
app.use('/api/bills', auth, billRoutes);

// ===== Error Handler =====
app.use((err, req, res, next) => {
  console.error('🔥 Eroare server:', err.message);
  res.status(500).json({ error: 'Eroare internă de server', details: err.message });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Ruta ${req.method} ${req.url} nu a fost găsită` });
});

// ===== Start Server =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Serverul SIGKILL rulează pe http://localhost:${PORT}`);
  console.log(`📡 API disponibil la http://localhost:${PORT}/api`);
});