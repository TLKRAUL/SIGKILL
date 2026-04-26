const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendPlanActivatedEmail, sendEnterpriseRequestEmail } = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'sigkill-secret-key-2026';

// Plan definitions
const PLANS = [
  {
    id: 'smart_saver',
    name: 'Smart Saver',
    subtitle: 'Essential / Starter',
    emoji: '🎓',
    price: 14.99,
    currency: 'RON',
    period: 'lună',
    target: 'Studenți, tineri profesioniști',
    description: 'Organizare de bază și reducerea risipei alimentare.',
    popular: false,
    features: [
      { text: 'Scanare până la 20 bonuri/lună', included: true },
      { text: 'Recunoaștere AI frigider & cămară', included: true },
      { text: 'Alerte de expirare pe telefon', included: true },
      { text: 'Bucătar AI — rețete din ce ai acasă', included: true },
      { text: 'Bugetare simplă (mâncare vs. facturi)', included: true },
      { text: 'Statistici predictive', included: false },
      { text: 'Planificator de mese săptămânal', included: false },
      { text: 'Sincronizare multi-user', included: false },
      { text: 'Digitalizarea garanțiilor', included: false },
      { text: 'Open Banking', included: false },
    ],
  },
  {
    id: 'family_cfo',
    name: 'Family CFO',
    subtitle: 'Premium · Cel mai popular',
    emoji: '👨‍👩‍👧‍👦',
    price: 49.99,
    currency: 'RON',
    period: 'lună',
    target: 'Familii, cupluri ocupate',
    description: 'Automatizare completă, inteligență financiară și planificare avansată.',
    popular: true,
    features: [
      { text: 'Scanare AI nelimitată', included: true },
      { text: 'Recunoaștere AI frigider & cămară', included: true },
      { text: 'Alerte de expirare inteligente', included: true },
      { text: 'Bucătar AI — rețete avansate + meniu săptămânal', included: true },
      { text: 'Statistici de economisire predictive', included: true },
      { text: 'Planificator mese + listă cumpărături auto', included: true },
      { text: 'Sincronizare multi-user (soț/soție)', included: true },
      { text: 'Digitalizarea garanțiilor + alerte', included: true },
      { text: 'Sfaturi AI: "Cumpără de marți, e -20%"', included: true },
      { text: 'Open Banking & facturare automată', included: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    subtitle: 'Open Wealth · B2B',
    emoji: '🏢',
    price: null,
    currency: 'RON',
    period: null,
    target: 'Companii, instituții, familii extinse',
    description: 'Automatizare totală, Open Banking și integrări externe.',
    popular: false,
    features: [
      { text: 'Tot ce include Family CFO', included: true },
      { text: 'Sincronizare Open Banking', included: true },
      { text: 'Facturare automată (Enel, Digi etc.)', included: true },
      { text: 'Modul Corporate/Fleet (500+ licențe)', included: true },
      { text: 'Asistent AI proactiv — negociere furnizori', included: true },
      { text: 'Mail automat de reziliere generat de AI', included: true },
      { text: 'Export contabil Excel/PDF', included: true },
      { text: 'Date statistice anonimizate pt. HR', included: true },
      { text: 'Suport dedicat & SLA', included: true },
      { text: 'Preț personalizat pe nr. utilizatori', included: true },
    ],
  },
];

// Middleware: decode JWT
function getUserFromToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  try {
    const token = authHeader.split(' ')[1];
    return jwt.verify(token, JWT_SECRET);
  } catch { return null; }
}

// GET /api/subscription/plans
router.get('/plans', (req, res) => {
  res.json(PLANS);
});

// GET /api/subscription/status
router.get('/status', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ error: 'Neautorizat' });

    const user = await User.findById(decoded.id).select('subscription name email');
    if (!user) return res.status(404).json({ error: 'Utilizator negăsit' });

    const trialActive = user.isTrialActive();
    const hasActive = user.hasActiveSubscription();
    const daysLeft = trialActive
      ? Math.ceil((user.subscription.trialEndsAt - new Date()) / 86400000)
      : 0;

    res.json({
      plan: user.subscription.plan,
      status: user.subscription.status,
      trialEndsAt: user.subscription.trialEndsAt,
      trialActive,
      trialDaysLeft: daysLeft,
      hasActiveSubscription: hasActive,
      subscribedAt: user.subscription.subscribedAt,
      expiresAt: user.subscription.expiresAt,
    });
  } catch (error) {
    res.status(500).json({ error: 'Eroare', details: error.message });
  }
});

// POST /api/subscription/select
router.post('/select', async (req, res) => {
  try {
    const decoded = getUserFromToken(req);
    if (!decoded) return res.status(401).json({ error: 'Neautorizat' });

    const { plan } = req.body;
    if (!['smart_saver', 'family_cfo'].includes(plan)) {
      return res.status(400).json({ error: 'Plan invalid. Alege smart_saver sau family_cfo.' });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ error: 'Utilizator negăsit' });

    user.subscription.plan = plan;
    user.subscription.status = 'active';
    user.subscription.subscribedAt = new Date();
    user.subscription.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // +30 zile
    await user.save();

    const planInfo = PLANS.find(p => p.id === plan);
    const planName = planInfo?.name || plan;
    console.log(`💳 Abonament activat: ${user.name} → ${planName}`);

    // Trimite email confirmare (non-blocking)
    sendPlanActivatedEmail(user.name, user.email, planName, planInfo?.price)
      .catch(e => console.error('Email plan fail:', e.message));

    res.json({
      message: `Pachetul ${planName} a fost activat! 🎉`,
      subscription: {
        plan: user.subscription.plan,
        status: user.subscription.status,
        subscribedAt: user.subscription.subscribedAt,
        expiresAt: user.subscription.expiresAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Eroare', details: error.message });
  }
});

// POST /api/subscription/enterprise-request
router.post('/enterprise-request', async (req, res) => {
  try {
    const { company, seats, email, phone, message } = req.body;

    if (!company || !seats || !email) {
      return res.status(400).json({ error: 'Completează compania, numărul de persoane și emailul.' });
    }

    // In production, this would send an email or save to a CRM
    console.log(`🏢 Cerere Enterprise:
  Companie: ${company}
  Persoane: ${seats}
  Email: ${email}
  Telefon: ${phone || 'N/A'}
  Mesaj: ${message || 'N/A'}`);

    // Dacă userul e logat, actualizează status
    const decoded = getUserFromToken(req);
    if (decoded) {
      await User.findByIdAndUpdate(decoded.id, {
        'subscription.plan': 'enterprise',
        'subscription.status': 'pending',
        'subscription.seats': seats,
      });
    }

    // Trimite emailuri (non-blocking)
    sendEnterpriseRequestEmail({ company, seats, email, phone, message })
      .catch(e => console.error('Email enterprise fail:', e.message));

    res.json({
      message: 'Cererea ta a fost trimisă! Te vom contacta în 24h.',
      requestDetails: { company, seats, email },
    });
  } catch (error) {
    res.status(500).json({ error: 'Eroare', details: error.message });
  }
});

module.exports = router;
