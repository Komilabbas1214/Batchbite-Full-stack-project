const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Business must have an owner'],
      unique: true,
    },
    name: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: [100, 'Business name cannot exceed 100 characters'],
    },
    tagline: {
      type: String,
      trim: true,
      default: 'Fresh, artisanal home-cooked batches',
    },
    description: {
      type: String,
      trim: true,
      default: 'Welcome to our home kitchen! We bake and cook in small artisanal batches with love and premium ingredients.',
    },
    cuisineType: {
      type: String,
      trim: true,
      default: 'Homestyle & Artisan',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    pickupInstructions: {
      type: String,
      trim: true,
      default: 'Please arrive during the designated pickup window. Call or ring the doorbell upon arrival.',
    },
    logoUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=300&q=80',
    },
    bannerUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    },
    isOpenForOrders: {
      type: Boolean,
      default: true,
    },
    socialLinks: {
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      website: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Business', businessSchema);
