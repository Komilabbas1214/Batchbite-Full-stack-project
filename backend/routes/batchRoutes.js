const express = require('express');
const router = express.Router();
const {
  getBatches,
  getBatchById,
  createBatch,
  updateBatch,
  updateBatchStatus,
} = require('../controllers/batchController');
const { createOrder } = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(getBatches)
  .post(protect, authorize('owner'), createBatch);

router.route('/:id')
  .get(getBatchById)
  .put(protect, authorize('owner'), updateBatch);

router.patch('/:id/status', protect, authorize('owner'), updateBatchStatus);

// Exact prompt specification: POST /api/batches/:id/orders
router.post('/:id/orders', protect, authorize('customer'), createOrder);

module.exports = router;
