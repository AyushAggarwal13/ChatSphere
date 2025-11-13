const mongoose = require('mongoose');

const connectDB = async (mongoURI) => {
  try {
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Error:', err);
    process.exit(1);
  }
};

module.exports = connectDB;
