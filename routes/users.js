const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken, verifyAdmin } = require('../middleware/verifyToken');


router.get('/', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.get('/top-freelancers', async (req, res) => {
  try {
    const freelancers = await User.find({ role: 'freelancer', isBlocked: false })
      .select('-password')
      .limit(6);
    res.json(freelancers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// All freelancers (Browse Freelancers page)
router.get('/freelancers', async (req, res) => {
  try {
    const freelancers = await User.find({ role: 'freelancer', isBlocked: false })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(freelancers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Single freelancer public profile
router.get('/freelancer/:id', async (req, res) => {
  try {
    const freelancer = await User.findById(req.params.id).select('-password');
    if (!freelancer || freelancer.role !== 'freelancer') {
      return res.status(404).json({ message: 'Freelancer not found' });
    }
    res.json(freelancer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Profile update
router.put('/profile/:email', verifyToken, async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      req.body,
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Block/Unblock (Admin)
router.put('/:id/block', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: req.body.isBlocked },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;