const mongoose = require('mongoose');

const verifyBetterAuth = async (req, res, next) => {
  try {
    const cookieHeader = req.headers.cookie || '';
    const match = cookieHeader.match(/better-auth\.session_token=([^;]+)/);
    if (!match) return res.status(401).json({ message: 'Not logged in' });

    const rawValue = decodeURIComponent(match[1]);
    const sessionToken = rawValue.split('.')[0]; // signature বাদ দিয়ে আসল token

    const db = mongoose.connection.db;
    const session = await db.collection('session').findOne({ token: sessionToken });

    if (!session) return res.status(401).json({ message: 'Invalid session' });
    if (new Date(session.expiresAt) < new Date()) {
      return res.status(401).json({ message: 'Session expired' });
    }

    const user = await db.collection('user').findOne({ _id: session.userId });
    if (!user) return res.status(401).json({ message: 'User not found' });
    if (user.isBlocked) return res.status(403).json({ message: 'Account blocked' });

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
    };

    next();
  } catch (err) {
    console.error('verifyBetterAuth error:', err.message);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access only' });
  }
  next();
};

module.exports = { verifyBetterAuth, requireAdmin };