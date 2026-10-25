const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies_db';
    
    mongoose.set('bufferCommands', false);

    const options = {
      autoIndex: true,
      serverSelectionTimeoutMS: 4000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(mongoUri, options);
    console.log(`[Database] MongoDB Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    console.warn('[Database] Tip: Ensure MongoDB service is running (e.g. `brew services start mongodb-community` or `docker-compose up mongo`).');
    // In production we exit; in dev we allow mock/offline fallback inspection
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
    return null;
  }
};

module.exports = connectDB;
