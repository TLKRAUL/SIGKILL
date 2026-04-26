const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendWelcomeEmail } = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'sigkill-secret-key-2026';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Toate câmpurile sunt obligatorii' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Parola trebuie să aibă cel puțin 6 caractere' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'Un cont cu acest email există deja' });
    }

    const user = new User({ name, email, password });
    const saved = await user.save();

    const token = jwt.sign({ id: saved._id, email: saved.email }, JWT_SECRET, { expiresIn: '7d' });

    console.log(`✅ Cont nou creat: ${saved.name} (${saved.email})`);

    // Trimite email de bun venit (non-blocking)
    sendWelcomeEmail(saved.name, saved.email).catch(e => console.error('Email welcome fail:', e.message));

    res.status(201).json({
      message: 'Cont creat cu succes! Ai 3 zile gratuite.',
      token,
      user: {
        id: saved._id, name: saved.name, email: saved.email,
        subscription: saved.subscription,
      },
    });
  } catch (error) {
    console.error('❌ Eroare register:', error.message);
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Un cont cu acest email există deja' });
    }
    res.status(500).json({ error: 'Eroare la înregistrare', details: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email-ul și parola sunt obligatorii' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Email sau parolă incorectă' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email sau parolă incorectă' });
    }

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    console.log(`✅ Login: ${user.name} (${user.email})`);

    res.json({
      message: 'Autentificare reușită!',
      token,
      user: {
        id: user._id, name: user.name, email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    console.error('❌ Eroare login:', error.message);
    res.status(500).json({ error: 'Eroare la autentificare', details: error.message });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token lipsă' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'Utilizatorul nu a fost găsit' });
    }

    res.json({ user: {
      id: user._id, name: user.name, email: user.email,
      subscription: user.subscription,
    }});
  } catch (error) {
    res.status(401).json({ error: 'Token invalid sau expirat' });
  }
});

module.exports = router;
