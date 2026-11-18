const express = require('express');
const router = express.Router();
const {
  getBusinessProfile,
  updateBusinessProfile,
  getPublicBusiness,
  getBusinessOrders,
  updateOrderStatus,
  getBusinessDashboard,
  getSalesReport,
} = require('../controllers/businessController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public route to view business details
router.get('/public/:id', getPublicBusiness);

// Owner protected routes
router.use(protect);
router.use(authorize('owner'));

router.get('/profile', getBusinessProfile);
router.put('/profile', updateBusinessProfile);
router.get('/orders', getBusinessOrders);
router.patch('/orders/:id/status', updateOrderStatus);
router.get('/dashboard', getBusinessDashboard);
router.get('/reports/sales', getSalesReport);

module.exports = router;
