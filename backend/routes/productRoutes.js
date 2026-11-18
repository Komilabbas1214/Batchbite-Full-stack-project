const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getProducts)
  .post(protect, authorize('owner'), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, authorize('owner'), updateProduct)
  .delete(protect, authorize('owner'), deleteProduct);

module.exports = router;
