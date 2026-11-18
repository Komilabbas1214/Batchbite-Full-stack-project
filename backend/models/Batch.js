const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      required: [true, 'Batch must belong to a business'],
    },
    batchName: {
      type: String,
      required: [true, 'Batch name is required'],
      trim: true,
      maxlength: [120, 'Batch name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    preparationDate: {
      type: Date,
      required: [true, 'Preparation date is required'],
    },
    orderDeadline: {
      type: Date,
      required: [true, 'Order deadline is required'],
    },
    pickupStartTime: {
      type: Date,
      default: null,
    },
    pickupEndTime: {
      type: Date,
      default: null,
    },
    pickupLocation: {
      type: String,
      trim: true,
      default: '',
    },
    pickupInstructions: {
      type: String,
      trim: true,
      default: '',
    },
    deliveryAvailable: {
      type: Boolean,
      default: false,
    },
    deliveryFee: {
      type: Number,
      default: 0,
      min: [0, 'Delivery fee cannot be negative'],
    },
    status: {
      type: String,
      enum: ['OPEN', 'CLOSED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'],
      default: 'OPEN',
    },
    items: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BatchItem',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Virtual helper to check if batch is open for ordering
batchSchema.virtual('isOrderingOpen').get(function () {
  const now = new Date();
  return this.status === 'OPEN' && new Date(this.orderDeadline) > now;
});

// Configure JSON serialization to include virtuals
batchSchema.set('toJSON', { virtuals: true });
batchSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Batch', batchSchema);
