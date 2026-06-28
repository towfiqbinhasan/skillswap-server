require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      tls: true
    });
    console.log('✅ MongoDB Connected');

    const existing = await User.findOne({ email: 'admin@skillswap.com' });
    if (existing) {
      console.log('⚠️ Admin already exists');
      process.exit(0);
    }

    const hashed = await bcrypt.hash('Admin123', 10);
    await User.create({
      name: 'Admin',
      email: 'admin@skillswap.com',
      password: hashed,
      role: 'admin',
      isBlocked: false
    });

    console.log('✅ Admin created successfully!');
    console.log('Email: admin@skillswap.com');
    console.log('Password: Admin123');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

seedAdmin();