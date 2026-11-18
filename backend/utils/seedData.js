require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const User = require('../models/User');
const Business = require('../models/Business');
const Product = require('../models/Product');
const Batch = require('../models/Batch');
const BatchItem = require('../models/BatchItem');
const Order = require('../models/Order');

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Clearing existing data...');
    await Order.deleteMany({});
    await BatchItem.deleteMany({});
    await Batch.deleteMany({});
    await Product.deleteMany({});
    await Business.deleteMany({});
    await User.deleteMany({});

    console.log('[Seed] Creating demo users...');

    // 1. Create Business Owner 1
    const owner1 = await User.create({
      name: 'Elena Rostova',
      email: 'owner@batchbite.com',
      password: 'password123',
      role: 'owner',
      phone: '+91 98765 43210',
      address: '142 Orchard Lane, Indiranagar',
    });

    const business1 = await Business.create({
      owner: owner1._id,
      name: "Elena's Artisan Sourdough & Patisserie",
      tagline: 'Naturally leavened sourdough and small-batch French pastries',
      description:
        'Every Friday and Sunday we bake handcrafted 48-hour fermented sourdough loaves and buttery Viennoiserie in limited batches using organic stone-milled grains.',
      cuisineType: 'Bakery & Pastry',
      email: 'elena@artisanbake.com',
      phone: '+91 98765 43210',
      address: '142 Orchard Lane, Indiranagar',
      city: 'Bengaluru',
      pickupInstructions:
        'Porch pickup: Walk up the garden path to the cottage porch. Bakes are pre-packaged in marked thermal bags with your name on them.',
      logoUrl:
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=1200&q=80',
      isOpenForOrders: true,
      socialLinks: {
        instagram: '@elenas_artisan_bakes',
        website: 'https://batchbite.com/b/elena',
      },
    });

    owner1.business = business1._id;
    await owner1.save();

    // 2. Create Business Owner 2
    const owner2 = await User.create({
      name: 'Chef Rajan Patel',
      email: 'raj@batchbite.com',
      password: 'password123',
      role: 'owner',
      phone: '+91 98234 56789',
      address: '88 Spice Ridge Way, Koramangala',
    });

    const business2 = await Business.create({
      owner: owner2._id,
      name: 'Dawat Heritage Home Feasts',
      tagline: 'Authentic royal dum biryanis and slow-cooked family recipes',
      description:
        'Cooking Sunday family feasts with generational spice blends, saffron, and tender slow-roasted marinades.',
      cuisineType: 'Main Dish',
      email: 'raj@dawatkitchen.com',
      phone: '+91 98234 56789',
      address: '88 Spice Ridge Way, Koramangala',
      city: 'Bengaluru',
      pickupInstructions:
        'Side gate pickup between 12:00 PM and 3:00 PM on Sunday. Freshly packed hot in insulated foil handis.',
      logoUrl:
        'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=400&q=80',
      bannerUrl:
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80',
      isOpenForOrders: true,
    });

    owner2.business = business2._id;
    await owner2.save();

    // 3. Create Customers
    const customer1 = await User.create({
      name: 'Sarah Jenkins',
      email: 'customer@batchbite.com',
      password: 'password123',
      role: 'customer',
      phone: '+91 97654 32109',
      address: 'Flat 4B, Palm Grove Apts, Indiranagar',
    });

    const customer2 = await User.create({
      name: 'Marcus Vance',
      email: 'marcus@example.com',
      password: 'password123',
      role: 'customer',
      phone: '+91 96543 21098',
      address: '22 Elm Street, Defense Colony',
    });

    console.log('[Seed] Creating demo products in INR (₹)...');

    // Products for Elena
    const p1 = await Product.create({
      business: business1._id,
      name: 'San Francisco Style Country Sourdough',
      description:
        'Classic 48-hour cold fermented sourdough with a blistered golden crust and tender, airy open crumb.',
      category: 'Bakery & Pastry',
      basePrice: 280.0,
      imageUrl:
        'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=600&q=80',
      ingredients: ['Organic Wheat Flour', 'Rye Flour', 'Water', 'Sea Salt', 'Wild Yeast Starter'],
      dietaryFlags: { isVegetarian: true, isVegan: true, isHalal: true },
      portionSize: '1 large batard (approx. 900g)',
      isActive: true,
    });

    const p2 = await Product.create({
      business: business1._id,
      name: 'Almond Frangipane Croissants (Pack of 4)',
      description:
        'Double-baked French butter croissants soaked with vanilla syrup, filled with rich almond frangipane cream and topped with toasted sliced almonds.',
      category: 'Bakery & Pastry',
      basePrice: 420.0,
      imageUrl:
        'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
      ingredients: ['French Butter', 'Unbleached Flour', 'Almond Flour', 'Eggs', 'Vanilla Pods', 'Sugar'],
      dietaryFlags: { isVegetarian: true, isHalal: true },
      portionSize: '4 large croissants',
      isActive: true,
    });

    const p3 = await Product.create({
      business: business1._id,
      name: 'Swedish Cardamom & Cinnamon Buns (6-Pack)',
      description:
        'Braided cardamom brioche dough filled with spiced brown butter cinnamon paste, dusted with pearl sugar.',
      category: 'Bakery & Pastry',
      basePrice: 350.0,
      imageUrl:
        'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      ingredients: ['Organic Flour', 'Butter', 'Fresh Cardamom', 'Cinnamon', 'Cane Sugar', 'Milk'],
      dietaryFlags: { isVegetarian: true, isHalal: true },
      portionSize: 'Box of 6 buns',
      isActive: true,
    });

    const p4 = await Product.create({
      business: business1._id,
      name: 'Rosemary Garlic Sea Salt Focaccia',
      description:
        'Ultra-hydrated olive oil flatbread dimpled and studded with garden fresh rosemary sprigs, roasted garlic confit, and flaky Maldon sea salt.',
      category: 'Bakery & Pastry',
      basePrice: 300.0,
      imageUrl:
        'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
      ingredients: ['Tipo 00 Flour', 'Extra Virgin Olive Oil', 'Fresh Rosemary', 'Garlic Confit', 'Flaky Sea Salt'],
      dietaryFlags: { isVegetarian: true, isVegan: true, isHalal: true },
      portionSize: 'Half sheet slab (serves 4-6)',
      isActive: true,
    });

    // Products for Rajan
    const p5 = await Product.create({
      business: business2._id,
      name: 'Royal Saffron Dum Biryani (Clay Handi)',
      description:
        'Slow steam-cooked long-grain aged Basmati rice layered with caramelized onions, fresh mint, and tender spiced cuts in a sealed earthen pot.',
      category: 'Main Dish',
      basePrice: 750.0,
      imageUrl:
        'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
      ingredients: ['Aged Basmati Rice', 'Kashmiri Saffron', 'Ghee', 'Whole Spices', 'Yogurt', 'Fresh Mint'],
      dietaryFlags: { isHalal: true, isGlutenFree: true },
      portionSize: 'Clay Handi (Serves 4 hearty portions)',
      isActive: true,
    });

    const p6 = await Product.create({
      business: business2._id,
      name: 'Dal Makhani & Garlic Butter Naan Feast',
      description:
        'Black lentils simmered overnight over slow charcoal embers with cultured butter, rich cream, and accompanied by 4 fresh tandoori garlic naans.',
      category: 'Main Dish',
      basePrice: 450.0,
      imageUrl:
        'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
      ingredients: ['Whole Black Urad', 'Makhan (Cultured Butter)', 'Fresh Cream', 'San Marzano Tomatoes', 'Garlic', 'Naan Flour'],
      dietaryFlags: { isVegetarian: true, isHalal: true },
      portionSize: '1 Quart Dal + 4 Fresh Naans (Serves 2-3)',
      isActive: true,
    });

    console.log('[Seed] Creating demo batches in INR (₹)...');

    // Batch 1: Open upcoming weekend batch for Elena
    const prepDate1 = new Date();
    prepDate1.setDate(prepDate1.getDate() + 3); // 3 days ahead
    prepDate1.setHours(10, 0, 0, 0);

    const deadlineDate1 = new Date();
    deadlineDate1.setDate(deadlineDate1.getDate() + 2); // 2 days ahead
    deadlineDate1.setHours(18, 0, 0, 0);

    const pickupStart1 = new Date(prepDate1);
    pickupStart1.setHours(10, 0, 0, 0);

    const pickupEnd1 = new Date(prepDate1);
    pickupEnd1.setHours(14, 0, 0, 0);

    const batch1 = await Batch.create({
      business: business1._id,
      batchName: 'Saturday Morning Warm Hearth Bake',
      description:
        'Limited weekend batch fresh out of the deck oven. Order ahead by Friday evening for Saturday porch pickup or doorstep local courier delivery.',
      preparationDate: prepDate1,
      orderDeadline: deadlineDate1,
      pickupStartTime: pickupStart1,
      pickupEndTime: pickupEnd1,
      pickupLocation: '142 Orchard Lane, Indiranagar, Bengaluru',
      pickupInstructions: 'Pick up from the bakery porch between 10 AM and 2 PM on Saturday.',
      deliveryAvailable: true,
      deliveryFee: 50.0,
      status: 'OPEN',
      items: [],
    });

    // Create Batch Items for batch 1
    const bi1 = await BatchItem.create({
      batch: batch1._id,
      product: p1._id,
      price: 280.0,
      maxQuantity: 20,
      orderedQuantity: 5,
      availableQuantity: 15,
      minOrderPerCustomer: 1,
      maxOrderPerCustomer: 4,
    });

    const bi2 = await BatchItem.create({
      batch: batch1._id,
      product: p2._id,
      price: 420.0,
      maxQuantity: 16,
      orderedQuantity: 4,
      availableQuantity: 12,
      minOrderPerCustomer: 1,
      maxOrderPerCustomer: 3,
    });

    const bi3 = await BatchItem.create({
      batch: batch1._id,
      product: p3._id,
      price: 350.0,
      maxQuantity: 12,
      orderedQuantity: 2,
      availableQuantity: 10,
      minOrderPerCustomer: 1,
      maxOrderPerCustomer: 2,
    });

    const bi4 = await BatchItem.create({
      batch: batch1._id,
      product: p4._id,
      price: 300.0,
      maxQuantity: 15,
      orderedQuantity: 3,
      availableQuantity: 12,
      minOrderPerCustomer: 1,
      maxOrderPerCustomer: 3,
    });

    batch1.items = [bi1._id, bi2._id, bi3._id, bi4._id];
    await batch1.save();

    // Batch 2: Rajan's Sunday Dum Biryani Feast (OPEN)
    const prepDate2 = new Date();
    prepDate2.setDate(prepDate2.getDate() + 4);
    prepDate2.setHours(12, 0, 0, 0);

    const deadlineDate2 = new Date();
    deadlineDate2.setDate(deadlineDate2.getDate() + 3);
    deadlineDate2.setHours(20, 0, 0, 0);

    const batch2 = await Batch.create({
      business: business2._id,
      batchName: 'Sunday Royal Dum Biryani & Dal Handi Bake',
      description:
        'Traditional sealed earthen handi biryanis and overnight slow-cooked dal makhani, ready hot for your Sunday family dinner.',
      preparationDate: prepDate2,
      orderDeadline: deadlineDate2,
      pickupStartTime: prepDate2,
      pickupEndTime: new Date(prepDate2.getTime() + 3 * 3600000),
      pickupLocation: '88 Spice Ridge Way, Koramangala, Bengaluru',
      pickupInstructions: 'Pick up hot at the front counter between 12:00 PM and 3:00 PM.',
      deliveryAvailable: true,
      deliveryFee: 60.0,
      status: 'OPEN',
      items: [],
    });

    const bi5 = await BatchItem.create({
      batch: batch2._id,
      product: p5._id,
      price: 750.0,
      maxQuantity: 15,
      orderedQuantity: 2,
      availableQuantity: 13,
      minOrderPerCustomer: 1,
      maxOrderPerCustomer: 3,
    });

    const bi6 = await BatchItem.create({
      batch: batch2._id,
      product: p6._id,
      price: 450.0,
      maxQuantity: 12,
      orderedQuantity: 1,
      availableQuantity: 11,
      minOrderPerCustomer: 1,
      maxOrderPerCustomer: 2,
    });

    batch2.items = [bi5._id, bi6._id];
    await batch2.save();

    console.log('[Seed] Creating demo orders in INR (₹)...');

    // Order 1: Placed by Sarah (Confirmed)
    await Order.create({
      orderNumber: 'BB-20261117-1001',
      customer: customer1._id,
      business: business1._id,
      batch: batch1._id,
      items: [
        {
          product: p1._id,
          batchItem: bi1._id,
          name: p1.name,
          price: 280.0,
          quantity: 2,
          subtotal: 560.0,
        },
        {
          product: p2._id,
          batchItem: bi2._id,
          name: p2.name,
          price: 420.0,
          quantity: 1,
          subtotal: 420.0,
        },
      ],
      subtotal: 980.0,
      deliveryFee: 0,
      totalAmount: 980.0,
      fulfillmentType: 'PICKUP',
      deliveryAddress: '',
      contactPhone: customer1.phone,
      customerNotes: 'Please slice one sourdough loaf if possible!',
      status: 'CONFIRMED',
      statusHistory: [
        { status: 'PENDING', changedAt: new Date(Date.now() - 3600000 * 5), note: 'Order placed by customer' },
        { status: 'CONFIRMED', changedAt: new Date(Date.now() - 3600000 * 2), note: 'Batch capacity confirmed by Elena' },
      ],
    });

    // Order 2: Placed by Marcus (Pending)
    await Order.create({
      orderNumber: 'BB-20261117-1002',
      customer: customer2._id,
      business: business1._id,
      batch: batch1._id,
      items: [
        {
          product: p4._id,
          batchItem: bi4._id,
          name: p4.name,
          price: 300.0,
          quantity: 2,
          subtotal: 600.0,
        },
        {
          product: p3._id,
          batchItem: bi3._id,
          name: p3.name,
          price: 350.0,
          quantity: 1,
          subtotal: 350.0,
        },
      ],
      subtotal: 950.0,
      deliveryFee: 50.0,
      totalAmount: 1000.0,
      fulfillmentType: 'DELIVERY',
      deliveryAddress: '22 Elm Street, Defense Colony, Bengaluru',
      contactPhone: customer2.phone,
      customerNotes: 'Leave on front porch behind the planter box',
      status: 'PENDING',
      statusHistory: [
        { status: 'PENDING', changedAt: new Date(Date.now() - 1800000), note: 'Order placed by customer' },
      ],
    });

    console.log('[Seed] Database seeded successfully with INR (₹) prices!');
    console.log('----------------------------------------------------');
    console.log('Demo Credentials:');
    console.log('Owner 1:    owner@batchbite.com / password123');
    console.log('Owner 2:    raj@batchbite.com / password123');
    console.log('Customer 1: customer@batchbite.com / password123');
    console.log('Customer 2: marcus@example.com / password123');
    console.log('----------------------------------------------------');

    if (process.argv.includes('--exit')) {
      process.exit(0);
    }
  } catch (error) {
    console.error('[Seed] Error seeding data:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
