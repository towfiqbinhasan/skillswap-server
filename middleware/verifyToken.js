const mongoose = require('mongoose');

const verifyToken = async (req, res, next) => {
  try {
    const cookieHeader = req.headers.cookie || '';
    const authHeader = req.headers.authorization || '';
    
    let sessionToken = null;

    // 1. Authorization header থেকে token নাও
    if (authHeader.startsWith('Bearer ')) {
      sessionToken = authHeader.replace('Bearer ', '').trim();
      console.log('🔑 Token from Authorization header');
      console.log('🔍 Token value:', sessionToken?.substring(0, 15) + '...');
    }

    // 2. Cookie থেকে token নাও
    if (!sessionToken) {
      const match = cookieHeader.match(/(?:__Secure-)?better-auth\.session_token=([^;]+)/);
      if (match) {
        const rawValue = decodeURIComponent(match[1]);
        sessionToken = rawValue.split('.')[0];
        console.log('🍪 Token from cookie');
        console.log('🔍 Token value:', sessionToken?.substring(0, 15) + '...');
      }
    }

    if (!sessionToken) {
      console.log('❌ No session token found');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const db = mongoose.connection.db;

    // sessions collection এ খোঁজো
    console.log('🔎 Searching in sessions collection...');
    let session = await db.collection('sessions').findOne({ token: sessionToken });
    
    if (!session) {
      console.log('🔎 Searching in session collection...');
      session = await db.collection('session').findOne({ token: sessionToken });
    }

    if (!session) {
      console.log('❌ Session not found in DB for token:', sessionToken?.substring(0, 15));
      return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log('✅ Session found!');

    if (new Date(session.expiresAt) < new Date()) {
      console.log('❌ Session expired');
      return res.status(401).json({ message: 'Session expired' });
    }

    // user খোঁজো
    let user = await db.collection('users').findOne({ _id: session.userId });
    if (!user) {
      user = await db.collection('user').findOne({ _id: session.userId });
    }

    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    console.log('✅ User found:', user.email);

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Account blocked' });
    }

    req.user = {
      id: user._id.toString(),
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
    };

    next();
  } catch (err) {
    console.error('verifyToken error:', err.message);
    return res.status(403).json({ message: 'Invalid token' });
  }
};

const verifyAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

module.exports = { verifyToken, verifyAdmin };