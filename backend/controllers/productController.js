const Product = require('../models/Product');
const Business = require('../models/Business');
const BatchItem = require('../models/BatchItem');

// @desc    Get all products (with optional filter by business, category, search)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { businessId, category, search, includeInactive } = req.query;

    const query = {};

    // By default, only show active products unless specifically requested (e.g., owner dashboard)
    if (includeInactive !== 'true') {
      query.isActive = true;
    }

    if (businessId) {
      query.business = businessId;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search && search.trim()) {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const products = await Product.find(query)
      .populate('business', 'name city isOpenForOrders logoUrl')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'business',
      'name city address phone pickupInstructions isOpenForOrders logoUrl'
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Owner only)
const createProduct = async (req, res, next) => {
  try {
    const business = await Business.findOne({ owner: req.user._id });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business profile not found. Please setup your business profile first.',
      });
    }

    const {
      name,
      description,
      category,
      basePrice,
      imageUrl,
      ingredients,
      dietaryFlags,
      portionSize,
      isActive,
    } = req.body;

    if (!name || basePrice === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Product name and base price are required',
      });
    }

    // Process ingredients if passed as comma-separated string or array
    let processedIngredients = [];
    if (Array.isArray(ingredients)) {
      processedIngredients = ingredients;
    } else if (typeof ingredients === 'string') {
      processedIngredients = ingredients
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);
    }

    const product = await Product.create({
      business: business._id,
      name,
      description: description || '',
      category: category || 'Main Dish',
      basePrice: Number(basePrice),
      imageUrl:
        imageUrl ||
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      ingredients: processedIngredients,
      dietaryFlags: dietaryFlags || {},
      portionSize: portionSize || '1 serving',
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Owner only)
const updateProduct = async (req, res, next) => {
  try {
    const business = await Business.findOne({ owner: req.user._id });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      business: business._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or does not belong to your business',
      });
    }

    const {
      name,
      description,
      category,
      basePrice,
      imageUrl,
      ingredients,
      dietaryFlags,
      portionSize,
      isActive,
    } = req.body;

    if (name !== undefined) product.name = name;
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (basePrice !== undefined) product.basePrice = Number(basePrice);
    if (imageUrl !== undefined) product.imageUrl = imageUrl;
    if (portionSize !== undefined) product.portionSize = portionSize;
    if (isActive !== undefined) product.isActive = isActive;
    if (dietaryFlags !== undefined) product.dietaryFlags = dietaryFlags;

    if (ingredients !== undefined) {
      if (Array.isArray(ingredients)) {
        product.ingredients = ingredients;
      } else if (typeof ingredients === 'string') {
        product.ingredients = ingredients
          .split(',')
          .map((i) => i.trim())
          .filter(Boolean);
      }
    }

    const updatedProduct = await product.save();

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product (or deactivate if already referenced in batches)
// @route   DELETE /api/products/:id
// @access  Private (Owner only)
const deleteProduct = async (req, res, next) => {
  try {
    const business = await Business.findOne({ owner: req.user._id });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found',
      });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      business: business._id,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found or does not belong to your business',
      });
    }

    // Check if product is associated with any batch items
    const isReferenced = await BatchItem.findOne({ product: product._id });

    if (isReferenced) {
      // Safely deactivate instead of hard delete to preserve historical integrity
      product.isActive = false;
      await product.save();
      return res.status(200).json({
        success: true,
        message:
          'Product is referenced in existing batches and was deactivated instead of deleted.',
        product,
      });
    } else {
      await Product.findByIdAndDelete(product._id);
      return res.status(200).json({
        success: true,
        message: 'Product deleted permanently',
      });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
