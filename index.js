const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();



const app = express();

// ✅ Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://taskhive-eight-phi.vercel.app',
    'https://skillswap-client-2ngr.vercel.app',
    'https://skillswap-client-2ngr-5ghspcncr-towfuw.vercel.app'
  ],
  credentials: true
}));
// ✅ Routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const proposalRoutes = require('./routes/proposals');
const userRoutes = require('./routes/users');
const paymentRoutes = require('./routes/payments');

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);

// ✅ MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4,
      tls: true
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB Error: ${err.message}`);
    process.exit(1);
  }
};

connectDB();

// ✅ Test Route
app.get('/', (req, res) => {
  res.json({ message: 'SkillSwap Server Running!' });
});

// ✅ Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
