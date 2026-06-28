const mongoose = require('mongoose');

const verifyToken = async (req, res, next) => {
  try {
    const cookieHeader = req.headers.cookie || '';
    console.log('🍪 RAW COOKIE HEADER:', cookieHeader);

    const match = cookieHeader.match(/better-auth\.session_token=([^;]+)/);
    if (!match) return res.status(401).json({ message: 'Unauthorized' });

    const rawValue = decodeURIComponent(match[1]);
    const sessionToken = rawValue.split('.')[0];

    const db = mongoose.connection.db;
    const session = await db.collection('session').findOne({ token: sessionToken });

    if (!session) return res.status(401).json({ message: 'Unauthorized' });
    if (new Date(session.expiresAt) < new Date()) {
      return res.status(401).json({ message: 'Session expired' });
    }

    const user = await db.collection('user').findOne({ _id: session.userId });
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    if (user.isBlocked) return res.status(403).json({ message: 'Account blocked' });

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
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  next();
};

module.exports = { verifyToken, verifyAdmin };