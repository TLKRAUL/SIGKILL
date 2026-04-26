const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  createProduct,
  createManyProducts,
  updateProduct,
  deleteProduct,
  getStats,
  useRecipe,
} = require('../controllers/productController');

// Stats trebuie ÎNAINTE de /:id ca să nu fie interpretat ca ID
router.get('/stats/summary', getStats);

// Use recipe — scade ingredientele
router.post('/use-recipe', useRecipe);

// CRUD
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', createProduct);
router.post('/bulk', createManyProducts);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
