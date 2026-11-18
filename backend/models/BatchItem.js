const mongoose = require('mongoose');

const batchItemSchema = new mongoose.Schema(
  {
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Batch',
      required: [true, 'Batch reference is required'],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required'],
    },
    price: {
      type: Number,
      required: [true, 'Batch item price is required'],
      min: [0, 'Price cannot be negative'],
    },
    maxQuantity: {
      type: Number,
      required: [true, 'Maximum quantity is required'],
      min: [1, 'Maximum quantity must be at least 1'],
    },
    orderedQuantity: {
      type: Number,
      default: 0,
      min: [0, 'Ordered quantity cannot be negative'],
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: [0, 'Available quantity cannot be negative'],
    },
    minOrderPerCustomer: {
      type: Number,
      default: 1,
      min: 1,
    },
    maxOrderPerCustomer: {
      type: Number,
      default: 10,
      min: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-validate hook to calculate availableQuantity if not set
batchItemSchema.pre('validate', function (next) {
  if (this.availableQuantity === undefined || this.isModified('maxQuantity') && !this.isModified('availableQuantity')) {
    this.availableQuantity = Math.max(0, this.maxQuantity - (this.orderedQuantity || 0));
  }
  next();
});

module.exports = mongoose.model('BatchItem', batchItemSchema);
