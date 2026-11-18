const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  // If already connected, return existing connection
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const primaryUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/batchbite';

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 2000,
    });
    console.log(`[DB] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.warn(`[DB] Primary MongoDB connection failed (${primaryUri}): ${err.message}`);
    console.log('[DB] Attempting fallback to MongoMemoryServer for standalone development...');

    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      if (!mongodInstance) {
        mongodInstance = await MongoMemoryServer.create({
          instance: {
            dbName: 'batchbite',
          },
        });
      }
      const memoryUri = mongodInstance.getUri();
      const conn = await mongoose.connect(memoryUri);
      console.log(`[DB] MongoMemoryServer connected successfully at: ${memoryUri}`);
      return conn;
    } catch (memErr) {
      console.error(`[DB] Fallback MongoMemoryServer failed: ${memErr.message}`);
      console.error('[DB] Please ensure MongoDB is running or provide a valid MONGO_URI in backend/.env');
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

module.exports = { connectDB, disconnectDB };
