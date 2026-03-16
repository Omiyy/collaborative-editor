const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      family: 4, // Force IPv4 for some Windows/Atlas DNS edge cases
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`✓ MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`✗ MongoDB connection error: ${error.message}`);
    console.error('Troubleshooting tips:');
    console.error('1. Check your IP is whitelisted in MongoDB Atlas Network Access');
    console.error('2. Verify MONGODB_URI in .env is correct');
    console.error('3. Go to https://cloud.mongodb.com → Network Access → Add Current IP');
    process.exit(1);
  }
};

module.exports = connectDB;
