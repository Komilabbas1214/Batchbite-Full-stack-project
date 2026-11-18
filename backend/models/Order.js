const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    batchItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BatchItem',
      required: true,
    },
    name: {
      type: String,
      required: true, // Snapshot of product name at order time
    },
    price: {
      type: Number,
      required: true, // Snapshot of batch price at order time
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    subtotal: {
      type: Number,
      required: true,
    },
  },
  { _id: true }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    note: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: true,
    },
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: true,
    },
    items: {
      type: [orderItemSchema],
      validate: [val => val.length > 0, 'An order must contain at least one item'],
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    fulfillmentType: {
      type: String,
      enum: ['PICKUP', 'DELIVERY'],
      default: 'PICKUP',
    },
    deliveryAddress: {
      type: String,
      trim: true,
      default: '',
    },
    contactPhone: {
      type: String,
      trim: true,
      default: '',
    },
    customerNotes: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED', 'REJECTED'],
      default: 'PENDING',
    },
    statusHistory: [statusHistorySchema],
    cancellationReason: {
      type: String,
      default: '',
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancelledBy: {
      type: String,
      enum: ['CUSTOMER', 'OWNER', 'SYSTEM', null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Helper method to determine if customer can cancel this order
// Rules: Customers can cancel if status is PENDING or CONFIRMED AND before batch order deadline
orderSchema.methods.canCustomerCancel = function (batchDeadline) {
  if (['CANCELLED', 'REJECTED', 'PREPARING', 'READY', 'COMPLETED'].includes(this.status)) {
    return { allowed: false, reason: `Orders with status '${this.status}' cannot be cancelled.` };
  }
  if (batchDeadline && new Date() > new Date(batchDeadline)) {
    return { allowed: false, reason: 'Order cancellation deadline has passed.' };
  }
  return { allowed: true, reason: '' };
};

module.exports = mongoose.model('Order', orderSchema);
