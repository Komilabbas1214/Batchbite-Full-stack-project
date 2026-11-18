const Business = require('../models/Business');
const Order = require('../models/Order');
const Batch = require('../models/Batch');
const BatchItem = require('../models/BatchItem');
const Product = require('../models/Product');

// Helper to get or ensure business for the current owner
const getOwnerBusiness = async (ownerId) => {
  let business = await Business.findOne({ owner: ownerId });
  if (!business) {
    business = await Business.create({
      owner: ownerId,
      name: 'My Artisan Kitchen',
    });
  }
  return business;
};

// @desc    Get owner's business profile
// @route   GET /api/business/profile
// @access  Private (Owner only)
const getBusinessProfile = async (req, res, next) => {
  try {
    const business = await getOwnerBusiness(req.user._id);
    return res.status(200).json({
      success: true,
      business,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update owner's business profile
// @route   PUT /api/business/profile
// @access  Private (Owner only)
const updateBusinessProfile = async (req, res, next) => {
  try {
    let business = await getOwnerBusiness(req.user._id);

    const allowedFields = [
      'name',
      'tagline',
      'description',
      'cuisineType',
      'email',
      'phone',
      'address',
      'city',
      'pickupInstructions',
      'logoUrl',
      'bannerUrl',
      'isOpenForOrders',
      'socialLinks',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        business[field] = req.body[field];
      }
    });

    const updatedBusiness = await business.save();

    return res.status(200).json({
      success: true,
      message: 'Business profile updated successfully',
      business: updatedBusiness,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get public business info by ID
// @route   GET /api/business/public/:id
// @access  Public
const getPublicBusiness = async (req, res, next) => {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }

    return res.status(200).json({
      success: true,
      business,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders for the owner's business
// @route   GET /api/business/orders
// @access  Private (Owner only)
const getBusinessOrders = async (req, res, next) => {
  try {
    const business = await getOwnerBusiness(req.user._id);
    const { status, batchId, limit = 50, page = 1 } = req.query;

    const query = { business: business._id };
    if (status) query.status = status;
    if (batchId) query.batch = batchId;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const orders = await Order.find(query)
      .populate('customer', 'name email phone')
      .populate('batch', 'batchName preparationDate orderDeadline status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalOrders = await Order.countDocuments(query);

    return res.status(200).json({
      success: true,
      count: orders.length,
      totalOrders,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalOrders / parseInt(limit)),
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PATCH /api/business/orders/:id/status
// @access  Private (Owner only)
const updateOrderStatus = async (req, res, next) => {
  try {
    const business = await getOwnerBusiness(req.user._id);
    const { status, note } = req.body;

    const validStatuses = [
      'PENDING',
      'CONFIRMED',
      'PREPARING',
      'READY',
      'COMPLETED',
      'CANCELLED',
      'REJECTED',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid options are: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      business: business._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found or does not belong to your business',
      });
    }

    const previousStatus = order.status;

    // If order was already completed, cancelled, or rejected, prevent invalid transitions
    if (previousStatus === 'CANCELLED' || previousStatus === 'REJECTED') {
      return res.status(400).json({
        success: false,
        message: `Cannot change status of an already ${previousStatus.toLowerCase()} order`,
      });
    }

    // If transitioning to CANCELLED or REJECTED from an active state, release reserved quantities back
    if (
      (status === 'CANCELLED' || status === 'REJECTED') &&
      !['CANCELLED', 'REJECTED'].includes(previousStatus)
    ) {
      for (const item of order.items) {
        await BatchItem.findByIdAndUpdate(item.batchItem, {
          $inc: {
            availableQuantity: item.quantity,
            orderedQuantity: -item.quantity,
          },
        });
      }
      order.cancelledAt = new Date();
      order.cancelledBy = 'OWNER';
      if (note) order.cancellationReason = note;
    }

    order.status = status;
    order.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user._id,
      note: note || `Status updated from ${previousStatus} to ${status}`,
    });

    const updatedOrder = await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get business dashboard statistics
// @route   GET /api/business/dashboard
// @access  Private (Owner only)
const getBusinessDashboard = async (req, res, next) => {
  try {
    const business = await getOwnerBusiness(req.user._id);

    // 1. Order Counts by Status
    const orders = await Order.find({ business: business._id });
    const totalOrders = orders.length;

    let pendingOrders = 0;
    let confirmedOrders = 0;
    let preparingOrders = 0;
    let readyOrders = 0;
    let completedOrders = 0;
    let cancelledOrders = 0;
    let rejectedOrders = 0;
    let totalConfirmedSales = 0;

    orders.forEach((ord) => {
      switch (ord.status) {
        case 'PENDING':
          pendingOrders++;
          break;
        case 'CONFIRMED':
          confirmedOrders++;
          totalConfirmedSales += ord.totalAmount;
          break;
        case 'PREPARING':
          preparingOrders++;
          totalConfirmedSales += ord.totalAmount;
          break;
        case 'READY':
          readyOrders++;
          totalConfirmedSales += ord.totalAmount;
          break;
        case 'COMPLETED':
          completedOrders++;
          totalConfirmedSales += ord.totalAmount;
          break;
        case 'CANCELLED':
          cancelledOrders++;
          break;
        case 'REJECTED':
          rejectedOrders++;
          break;
      }
    });

    // 2. Batches stats
    const activeBatchesList = await Batch.find({
      business: business._id,
      status: { $in: ['OPEN', 'PREPARING', 'READY'] },
    })
      .populate({
        path: 'items',
        populate: { path: 'product', select: 'name category imageUrl' },
      })
      .sort({ preparationDate: 1 });

    const activeBatchesCount = activeBatchesList.length;

    // 3. Remaining product quantities in active batches
    const remainingInventory = [];
    activeBatchesList.forEach((b) => {
      if (b.items && b.items.length > 0) {
        b.items.forEach((item) => {
          remainingInventory.push({
            batchId: b._id,
            batchName: b.batchName,
            preparationDate: b.preparationDate,
            productName: item.product ? item.product.name : 'Unknown Product',
            imageUrl: item.product ? item.product.imageUrl : '',
            maxQuantity: item.maxQuantity,
            orderedQuantity: item.orderedQuantity,
            availableQuantity: item.availableQuantity,
          });
        });
      }
    });

    // 4. Recent customer orders (latest 6)
    const recentOrders = await Order.find({ business: business._id })
      .populate('customer', 'name email phone')
      .populate('batch', 'batchName preparationDate')
      .sort({ createdAt: -1 })
      .limit(6);

    // 5. Total Products count
    const totalProducts = await Product.countDocuments({
      business: business._id,
      isActive: true,
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        preparingOrders,
        readyOrders,
        completedOrders,
        cancelledOrders,
        rejectedOrders,
        totalConfirmedSales,
        activeBatches: activeBatchesCount,
        totalProducts,
      },
      activeBatches: activeBatchesList,
      remainingInventory,
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get detailed sales report
// @route   GET /api/business/reports/sales
// @access  Private (Owner only)
const getSalesReport = async (req, res, next) => {
  try {
    const business = await getOwnerBusiness(req.user._id);

    // Fetch all confirmed/completed/preparing/ready orders
    const validOrders = await Order.find({
      business: business._id,
      status: { $in: ['CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'] },
    })
      .populate('customer', 'name email')
      .populate('batch', 'batchName preparationDate')
      .sort({ createdAt: -1 });

    let totalRevenue = 0;
    let totalItemsSold = 0;
    const productSalesMap = {};
    const batchSalesMap = {};

    validOrders.forEach((ord) => {
      totalRevenue += ord.totalAmount;
      const bName = ord.batch ? ord.batch.batchName : 'General';
      if (!batchSalesMap[bName]) {
        batchSalesMap[bName] = { batchName: bName, revenue: 0, orderCount: 0 };
      }
      batchSalesMap[bName].revenue += ord.totalAmount;
      batchSalesMap[bName].orderCount += 1;

      ord.items.forEach((item) => {
        totalItemsSold += item.quantity;
        if (!productSalesMap[item.name]) {
          productSalesMap[item.name] = {
            productName: item.name,
            quantitySold: 0,
            revenue: 0,
          };
        }
        productSalesMap[item.name].quantitySold += item.quantity;
        productSalesMap[item.name].revenue += item.subtotal;
      });
    });

    const productSales = Object.values(productSalesMap).sort(
      (a, b) => b.revenue - a.revenue
    );
    const batchSales = Object.values(batchSalesMap).sort(
      (a, b) => b.revenue - a.revenue
    );

    return res.status(200).json({
      success: true,
      report: {
        totalRevenue,
        totalOrdersCount: validOrders.length,
        totalItemsSold,
        productSales,
        batchSales,
        orders: validOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBusinessProfile,
  updateBusinessProfile,
  getPublicBusiness,
  getBusinessOrders,
  updateOrderStatus,
  getBusinessDashboard,
  getSalesReport,
};
