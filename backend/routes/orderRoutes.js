const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Customer specific order endpoints
router.get('/my', authorize('customer'), getMyOrders);
router.post('/batch/:id', authorize('customer'), createOrder);
router.patch('/:id/cancel', authorize('customer'), cancelOrder);

// Shared endpoint (Customer can view their own, Owner can view orders for their business)
router.get('/:id', getOrderById);

module.exports = router;
