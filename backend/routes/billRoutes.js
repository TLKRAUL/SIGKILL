const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const Bill = require('../models/Bill');
const { scanBillWithAI, scanBillFromBase64, findBetterSupplierAI } = require('../services/aiService');

// POST /api/bills/scan — Scanează imagine factură (per user)
router.post('/scan', upload.single('receipt'), async (req, res) => {
  try {
    let aiResult = null;

    if (req.file) {
      console.log('📄 Scanare factură imagine:', req.file.originalname);
      aiResult = await scanBillWithAI(req.file.path);
    } else if (req.body.image) {
      console.log('📄 Scanare factură base64');
      const mimeType = req.body.mimeType || 'image/jpeg';
      aiResult = await scanBillFromBase64(req.body.image, mimeType);
    } else {
      return res.status(400).json({ error: 'Trimite o imagine cu factura.' });
    }

    if (!aiResult || !aiResult.success) {
      return res.status(422).json({ error: 'Nu am putut procesa factura', details: aiResult?.error });
    }

    const bill = new Bill({
      provider: aiResult.provider || 'Necunoscut',
      service: aiResult.service || 'Necunoscut',
      amount: aiResult.amount || 0,
      dueDate: aiResult.dueDate ? new Date(aiResult.dueDate) : null,
      contractNumber: aiResult.contractNumber || '',
      status: 'unpaid',
      imageUrl: req.file ? req.file.path : null,
      user: req.userId,
    });

    const saved = await bill.save();
    console.log(`✅ Factură scanată: ${saved.provider} — ${saved.amount} RON`);

    res.status(201).json({
      message: `Factură de la ${saved.provider} adăugată: ${saved.amount} RON`,
      bill: saved,
    });
  } catch (error) {
    console.error('❌ Eroare scanare factură:', error.message);
    res.status(500).json({ error: 'Eroare la procesarea facturii', details: error.message });
  }
});

// GET /api/bills (per user)
router.get('/', async (req, res) => {
  try {
    const bills = await Bill.find({ user: req.userId }).sort({ dueDate: 1 });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: 'Eroare', details: error.message });
  }
});

// PUT /api/bills/:id (per user)
router.put('/:id', async (req, res) => {
  try {
    const updated = await Bill.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Factura nu a fost găsită' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Eroare', details: error.message });
  }
});

// DELETE /api/bills/:id (per user)
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Bill.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!deleted) return res.status(404).json({ error: 'Factura nu a fost găsită' });
    res.json({ message: 'Factură ștearsă' });
  } catch (error) {
    res.status(500).json({ error: 'Eroare', details: error.message });
  }
});

// POST /api/bills/find-better — AI caută furnizor mai bun (bazat pe prețul de pe factură)
router.post('/find-better', async (req, res) => {
  try {
    const { service, provider, amount } = req.body;
    if (!service || !amount) {
      return res.status(400).json({ error: 'Serviciul și suma sunt obligatorii' });
    }
    const result = await findBetterSupplierAI(service, provider, amount);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Eroare AI', details: error.message });
  }
});

module.exports = router;
