const Batch = require('../models/Batch');
const BatchItem = require('../models/BatchItem');
const Business = require('../models/Business');
const Product = require('../models/Product');

// @desc    Get batches (Customers see active/open batches; Owners can view all their batches)
// @route   GET /api/batches
// @access  Public
const getBatches = async (req, res, next) => {
  try {
    const { businessId, status, all, search } = req.query;

    const query = {};

    if (businessId) {
      query.business = businessId;
    }

    // If 'all' is not set to true, only show open batches with deadlines in the future
    if (all !== 'true') {
      const now = new Date();
      query.status = 'OPEN';
      query.orderDeadline = { $gt: now };
    } else if (status) {
      query.status = status;
    }

    if (search && search.trim()) {
      query.$or = [
        { batchName: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { pickupLocation: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const batches = await Batch.find(query)
      .populate('business', 'name city address phone pickupInstructions logoUrl isOpenForOrders')
      .populate({
        path: 'items',
        populate: {
          path: 'product',
          select: 'name description category basePrice imageUrl dietaryFlags portionSize isActive',
        },
      })
      .sort({ preparationDate: 1 });

    return res.status(200).json({
      success: true,
      count: batches.length,
      batches,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single batch by ID
// @route   GET /api/batches/:id
// @access  Public
const getBatchById = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('business', 'name tagline description city address phone pickupInstructions logoUrl bannerUrl isOpenForOrders')
      .populate({
        path: 'items',
        populate: {
          path: 'product',
          select: 'name description category basePrice imageUrl dietaryFlags portionSize isActive ingredients',
        },
      });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found',
      });
    }

    return res.status(200).json({
      success: true,
      batch,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new batch with items
// @route   POST /api/batches
// @access  Private (Owner only)
const createBatch = async (req, res, next) => {
  try {
    const business = await Business.findOne({ owner: req.user._id });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found. Please setup your business profile first.',
      });
    }

    const {
      batchName,
      description,
      preparationDate,
      orderDeadline,
      pickupStartTime,
      pickupEndTime,
      pickupLocation,
      pickupInstructions,
      deliveryAvailable,
      deliveryFee,
      items, // array of { productId, price, maxQuantity, minOrderPerCustomer, maxOrderPerCustomer }
    } = req.body;

    if (!batchName || !preparationDate || !orderDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Batch name, preparation date, and order deadline are required',
      });
    }

    if (new Date(orderDeadline) > new Date(preparationDate)) {
      return res.status(400).json({
        success: false,
        message: 'Order deadline must be before or on the preparation date',
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'A batch must include at least one food product item',
      });
    }

    // Create the batch record
    const batch = new Batch({
      business: business._id,
      batchName,
      description: description || '',
      preparationDate: new Date(preparationDate),
      orderDeadline: new Date(orderDeadline),
      pickupStartTime: pickupStartTime ? new Date(pickupStartTime) : null,
      pickupEndTime: pickupEndTime ? new Date(pickupEndTime) : null,
      pickupLocation: pickupLocation || business.address || '',
      pickupInstructions: pickupInstructions || business.pickupInstructions || '',
      deliveryAvailable: !!deliveryAvailable,
      deliveryFee: deliveryFee ? Number(deliveryFee) : 0,
      status: 'OPEN',
      items: [],
    });

    await batch.save();

    // Create BatchItem documents for each product
    const createdItemIds = [];
    for (const item of items) {
      const product = await Product.findOne({
        _id: item.productId,
        business: business._id,
      });

      if (!product) {
        // Rollback batch if product invalid
        await Batch.findByIdAndDelete(batch._id);
        await BatchItem.deleteMany({ batch: batch._id });
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.productId} was not found in your business`,
        });
      }

      const itemPrice = item.price !== undefined ? Number(item.price) : product.basePrice;
      const maxQty = Number(item.maxQuantity) || 10;

      const batchItem = await BatchItem.create({
        batch: batch._id,
        product: product._id,
        price: itemPrice,
        maxQuantity: maxQty,
        orderedQuantity: 0,
        availableQuantity: maxQty,
        minOrderPerCustomer: item.minOrderPerCustomer ? Number(item.minOrderPerCustomer) : 1,
        maxOrderPerCustomer: item.maxOrderPerCustomer ? Number(item.maxOrderPerCustomer) : 10,
      });

      createdItemIds.push(batchItem._id);
    }

    batch.items = createdItemIds;
    await batch.save();

    const populatedBatch = await Batch.findById(batch._id)
      .populate('business')
      .populate({
        path: 'items',
        populate: { path: 'product' },
      });

    return res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      batch: populatedBatch,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update batch details and items
// @route   PUT /api/batches/:id
// @access  Private (Owner only)
const updateBatch = async (req, res, next) => {
  try {
    const business = await Business.findOne({ owner: req.user._id });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }

    const batch = await Batch.findOne({
      _id: req.params.id,
      business: business._id,
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found or does not belong to your business',
      });
    }

    const {
      batchName,
      description,
      preparationDate,
      orderDeadline,
      pickupStartTime,
      pickupEndTime,
      pickupLocation,
      pickupInstructions,
      deliveryAvailable,
      deliveryFee,
      status,
      items, // updated items list
    } = req.body;

    if (batchName !== undefined) batch.batchName = batchName;
    if (description !== undefined) batch.description = description;
    if (preparationDate !== undefined) batch.preparationDate = new Date(preparationDate);
    if (orderDeadline !== undefined) batch.orderDeadline = new Date(orderDeadline);
    if (pickupStartTime !== undefined) batch.pickupStartTime = pickupStartTime ? new Date(pickupStartTime) : null;
    if (pickupEndTime !== undefined) batch.pickupEndTime = pickupEndTime ? new Date(pickupEndTime) : null;
    if (pickupLocation !== undefined) batch.pickupLocation = pickupLocation;
    if (pickupInstructions !== undefined) batch.pickupInstructions = pickupInstructions;
    if (deliveryAvailable !== undefined) batch.deliveryAvailable = deliveryAvailable;
    if (deliveryFee !== undefined) batch.deliveryFee = Number(deliveryFee);
    if (status !== undefined) batch.status = status;

    // Handle items update if supplied
    if (items && Array.isArray(items)) {
      for (const item of items) {
        if (item.batchItemId) {
          // Update existing batch item
          const existingItem = await BatchItem.findById(item.batchItemId);
          if (existingItem) {
            if (item.price !== undefined) existingItem.price = Number(item.price);
            if (item.maxQuantity !== undefined) {
              const newMax = Number(item.maxQuantity);
              existingItem.maxQuantity = newMax;
              existingItem.availableQuantity = Math.max(0, newMax - existingItem.orderedQuantity);
            }
            if (item.minOrderPerCustomer !== undefined) existingItem.minOrderPerCustomer = Number(item.minOrderPerCustomer);
            if (item.maxOrderPerCustomer !== undefined) existingItem.maxOrderPerCustomer = Number(item.maxOrderPerCustomer);
            await existingItem.save();
          }
        } else if (item.productId) {
          // Add new product item to existing batch
          const product = await Product.findOne({ _id: item.productId, business: business._id });
          if (product) {
            const maxQty = Number(item.maxQuantity) || 10;
            const newItem = await BatchItem.create({
              batch: batch._id,
              product: product._id,
              price: item.price !== undefined ? Number(item.price) : product.basePrice,
              maxQuantity: maxQty,
              orderedQuantity: 0,
              availableQuantity: maxQty,
            });
            batch.items.push(newItem._id);
          }
        }
      }
    }

    await batch.save();

    const updatedBatch = await Batch.findById(batch._id)
      .populate('business')
      .populate({
        path: 'items',
        populate: { path: 'product' },
      });

    return res.status(200).json({
      success: true,
      message: 'Batch updated successfully',
      batch: updatedBatch,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Quick update batch status (e.g., OPEN, CLOSED, PREPARING, READY, COMPLETED, CANCELLED)
// @route   PATCH /api/batches/:id/status
// @access  Private (Owner only)
const updateBatchStatus = async (req, res, next) => {
  try {
    const business = await Business.findOne({ owner: req.user._id });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }

    const { status } = req.body;
    const validStatuses = ['OPEN', 'CLOSED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid options are: ${validStatuses.join(', ')}`,
      });
    }

    const batch = await Batch.findOne({
      _id: req.params.id,
      business: business._id,
    });

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found or does not belong to your business',
      });
    }

    batch.status = status;
    await batch.save();

    return res.status(200).json({
      success: true,
      message: `Batch status changed to ${status}`,
      batch,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBatches,
  getBatchById,
  createBatch,
  updateBatch,
  updateBatchStatus,
};
