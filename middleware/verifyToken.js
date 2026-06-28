const mongoose = require('mongoose');

const verifyToken = async (req, res, next) => {
  try {
    const cookieHeader = req.headers.cookie || '';
    console.log('🍪 RAW COOKIE HEADER:', cookieHeader);

    // Production এ __Secure- prefix আসে, development এ আসে না
    const match = cookieHeader.match(/(?:__Secure-)?better-auth\.session_token=([^;]+)/);
    
    if (!match) {
      console.log('❌ No session token found in cookies');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const rawValue = decodeURIComponent(match[1]);
    const sessionToken = rawValue.split('.')[0];
    
    console.log('🔑 Session token:', sessionToken?.substring(0, 20) + '...');

    const db = mongoose.connection.db;
    
    // sessions collection এ খোঁজো
    let session = await db.collection('sessions').findOne({ token: sessionToken });
    
    // না পেলে session collection এ খোঁজো
    if (!session) {
      session = await db.collection('session').findOne({ token: sessionToken });
    }

    if (!session) {
      console.log('❌ Session not found in DB');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (new Date(session.expiresAt) < new Date()) {
      return res.status(401).json({ message: 'Session expired' });
    }

    // users collection এ খোঁজো
    let user = await db.collection('users').findOne({ _id: session.userId });
    
    // না পেলে user collection এ খোঁজো
    if (!user) {
      user = await db.collection('user').findOne({ _id: session.userId });
    }

    if (!user) {
      console.log('❌ User not found');
      return res.status(401).json({ message: 'Unauthorized' });
    }

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