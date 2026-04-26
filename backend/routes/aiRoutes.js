const express = require('express');
const router = express.Router();
const { askAI, getRecipes, getMealPlan } = require('../controllers/receiptController');

// POST /api/ai/ask — Chat cu AI
router.post('/ask', askAI);

// GET /api/ai/recipes — Sugestii de rețete
router.get('/recipes', getRecipes);

// POST /api/ai/meal-plan — Plan alimentar AI
router.post('/meal-plan', getMealPlan);

module.exports = router;

