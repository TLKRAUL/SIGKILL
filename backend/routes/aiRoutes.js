const express = require('express');
const router = express.Router();
const { askAI, getRecipes } = require('../controllers/receiptController');

// POST /api/ai/ask — Chat cu AI
router.post('/ask', askAI);

// GET /api/ai/recipes — Sugestii de rețete
router.get('/recipes', getRecipes);

module.exports = router;
