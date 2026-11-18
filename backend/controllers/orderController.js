const Order = require('../models/Order');
const Batch = require('../models/Batch');
const BatchItem = require('../models/BatchItem');
const Business = require('../models/Business');

// Helper to generate unique order number: BB-YYYYMMDD-RANDOM
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `BB-${dateStr}-${randomSuffix}`;
};

// @desc    Place a new pre-order for a batch
// @route   POST /api/batches/:id/orders
// @access  Private (Customer only)
const createOrder = async (req, res, next) => {
  try {
    const batchId = req.params.id;
    const { items, fulfillmentType, deliveryAddress, contactPhone, customerNotes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one product item',
      });
    }

    // 1. Fetch batch
    const batch = await Batch.findById(batchId).populate('business');
    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
    }

    // 2. Validate batch status
    if (batch.status !== 'OPEN') {
      return res.status(400).json({
        success: false,
        message: `This batch is currently ${batch.status.toLowerCase()} and cannot accept orders.`,
      });
    }

    // 3. Validate deadline
    const now = new Date();
    if (now > new Date(batch.orderDeadline)) {
      return res.status(400).json({
        success: false,
        message: 'The order deadline for this batch has passed. Orders are closed.',
      });
    }

    // 4. Validate business accepts orders
    if (!batch.business.isOpenForOrders) {
      return res.status(400).json({
        success: false,
        message: 'This kitchen is temporarily closed for orders.',
      });
    }

    // 5. Validate fulfillment info
    if (fulfillmentType === 'DELIVERY' && !batch.deliveryAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Delivery is not available for this batch. Please choose Pickup.',
      });
    }

    if (fulfillmentType === 'DELIVERY' && (!deliveryAddress || !deliveryAddress.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address is required for delivery orders.',
      });
    }

    // 6. Atomically reserve inventory to prevent race conditions & overbooking
    const reservedItems = [];
    const orderItemsSnapshot = [];
    let calculatedSubtotal = 0;

    for (const itemReq of items) {
      const requestedQty = parseInt(itemReq.quantity, 10);
      if (!requestedQty || requestedQty <= 0) {
        // Rollback already reserved
        for (const resItem of reservedItems) {
          await BatchItem.findByIdAndUpdate(resItem.batchItemId, {
            $inc: { availableQuantity: resItem.quantity, orderedQuantity: -resItem.quantity },
          });
        }
        return res.status(400).json({
          success: false,
          message: 'Invalid item quantity specified.',
        });
      }

      // Atomic conditional update: only update if availableQuantity >= requestedQty
      const updatedBatchItem = await BatchItem.findOneAndUpdate(
        {
          _id: itemReq.batchItemId,
          batch: batch._id,
          availableQuantity: { $gte: requestedQty },
        },
        {
          $inc: {
            availableQuantity: -requestedQty,
            orderedQuantity: requestedQty,
          },
        },
        { new: true }
      ).populate('product');

      if (!updatedBatchItem) {
        // Rollback any items previously reserved in this loop
        for (const resItem of reservedItems) {
          await BatchItem.findByIdAndUpdate(resItem.batchItemId, {
            $inc: { availableQuantity: resItem.quantity, orderedQuantity: -resItem.quantity },
          });
        }

        return res.status(409).json({
          success: false,
          message:
            'One or more items in your cart just sold out or have insufficient remaining quantity. Please adjust your cart.',
        });
      }

      // Check min and max order limits per customer
      if (
        requestedQty < updatedBatchItem.minOrderPerCustomer ||
        requestedQty > updatedBatchItem.maxOrderPerCustomer
      ) {
        // Rollback
        await BatchItem.findByIdAndUpdate(itemReq.batchItemId, {
          $inc: { availableQuantity: requestedQty, orderedQuantity: -requestedQty },
        });
        for (const resItem of reservedItems) {
          await BatchItem.findByIdAndUpdate(resItem.batchItemId, {
            $inc: { availableQuantity: resItem.quantity, orderedQuantity: -resItem.quantity },
          });
        }
        return res.status(400).json({
          success: false,
          message: `Quantity for "${updatedBatchItem.product.name}" must be between ${updatedBatchItem.minOrderPerCustomer} and ${updatedBatchItem.maxOrderPerCustomer}.`,
        });
      }

      reservedItems.push({
        batchItemId: updatedBatchItem._id,
        quantity: requestedQty,
      });

      const itemSubtotal = updatedBatchItem.price * requestedQty;
      calculatedSubtotal += itemSubtotal;

      // Store immutable snapshot
      orderItemsSnapshot.push({
        product: updatedBatchItem.product._id,
        batchItem: updatedBatchItem._id,
        name: updatedBatchItem.product.name,
        price: updatedBatchItem.price,
        quantity: requestedQty,
        subtotal: itemSubtotal,
      });
    }

    const deliveryFee =
      fulfillmentType === 'DELIVERY' && batch.deliveryFee ? Number(batch.deliveryFee) : 0;
    const totalAmount = calculatedSubtotal + deliveryFee;

    // 7. Create the Order
    let orderNumber = generateOrderNumber();
    // Ensure unique orderNumber
    let exists = await Order.findOne({ orderNumber });
    while (exists) {
      orderNumber = generateOrderNumber();
      exists = await Order.findOne({ orderNumber });
    }

    const order = await Order.create({
      orderNumber,
      customer: req.user._id,
      business: batch.business._id,
      batch: batch._id,
      items: orderItemsSnapshot,
      subtotal: calculatedSubtotal,
      deliveryFee,
      totalAmount,
      fulfillmentType: fulfillmentType || 'PICKUP',
      deliveryAddress: fulfillmentType === 'DELIVERY' ? deliveryAddress.trim() : '',
      contactPhone: contactPhone || req.user.phone || '',
      customerNotes: customerNotes || '',
      status: 'PENDING',
      statusHistory: [
        {
          status: 'PENDING',
          changedAt: new Date(),
          changedBy: req.user._id,
          note: 'Order placed by customer',
        },
      ],
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('business', 'name phone email address city pickupInstructions logoUrl')
      .populate('batch', 'batchName preparationDate orderDeadline pickupStartTime pickupEndTime pickupLocation pickupInstructions')
      .populate('customer', 'name email phone');

    return res.status(201).json({
      success: true,
      message: 'Pre-order placed successfully!',
      order: populatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in customer's order history
// @route   GET /api/orders/my
// @access  Private (Customer only)
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('business', 'name phone email address city logoUrl')
      .populate('batch', 'batchName preparationDate orderDeadline status pickupLocation')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order details by ID
// @route   GET /api/orders/:id
// @access  Private (Customer or Owner of the business)
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('business', 'name phone email address city pickupInstructions logoUrl')
      .populate('batch', 'batchName preparationDate orderDeadline pickupStartTime pickupEndTime pickupLocation pickupInstructions status');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Authorization check: must be the customer who placed the order OR owner of the business
    const isCustomer = order.customer._id.toString() === req.user._id.toString();
    const isBusinessOwner =
      req.user.role === 'owner' &&
      req.user.business &&
      req.user.business.toString() === order.business._id.toString();

    if (!isCustomer && !isBusinessOwner) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden: You cannot view orders for another account.',
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an order by customer
// @route   PATCH /api/orders/:id/cancel
// @access  Private (Customer only)
const cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id).populate('batch');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Verify customer ownership
    if (order.customer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own orders',
      });
    }

    // Check cancellation rules
    const check = order.canCustomerCancel(order.batch ? order.batch.orderDeadline : null);
    if (!check.allowed) {
      return res.status(400).json({
        success: false,
        message: check.reason,
      });
    }

    // Release reserved quantities back to BatchItem
    for (const item of order.items) {
      await BatchItem.findByIdAndUpdate(item.batchItem, {
        $inc: {
          availableQuantity: item.quantity,
          orderedQuantity: -item.quantity,
        },
      });
    }

    order.status = 'CANCELLED';
    order.cancelledAt = new Date();
    order.cancelledBy = 'CUSTOMER';
    order.cancellationReason = reason || 'Customer requested cancellation';
    order.statusHistory.push({
      status: 'CANCELLED',
      changedAt: new Date(),
      changedBy: req.user._id,
      note: `Cancelled by customer: ${order.cancellationReason}`,
    });

    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Order has been successfully cancelled and inventory released.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
};
