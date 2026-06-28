const express = require('express');
const router = express.Router();
const Proposal = require('../models/Proposal');
const Task = require('../models/Task');
const { verifyToken } = require('../middleware/verifyToken');

// Submit proposal
router.post('/', verifyToken, async (req, res) => {
  try {
    const existing = await Proposal.findOne({
      task_id: req.body.task_id,
      freelancer_email: req.body.freelancer_email
    });
    if (existing) return res.status(400).json({ message: 'Already applied' });
    const proposal = await Proposal.create(req.body);
    res.status(201).json(proposal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Freelancer এর proposals
router.get('/freelancer/:email', verifyToken, async (req, res) => {
  try {
    const proposals = await Proposal.find({ freelancer_email: req.params.email })
      .populate('task_id', 'title budget status deliverable_url')
      .sort({ submitted_at: -1 });
    res.json(proposals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Task এর proposals
router.get('/task/:taskId', verifyToken, async (req, res) => {
  try {
    const proposals = await Proposal.find({ task_id: req.params.taskId });
    res.json(proposals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Accept proposal — task status in-progress করো
router.put('/:id/accept', verifyToken, async (req, res) => {
  try {
    const proposal = await Proposal.findByIdAndUpdate(
      req.params.id,
      { status: 'accepted' },
      { new: true }
    );

    // Task status in-progress করো
    if (proposal?.task_id) {
      await Task.findByIdAndUpdate(proposal.task_id, { status: 'in-progress' });
    }

    // অন্য proposals reject করো
    await Proposal.updateMany(
      { task_id: proposal.task_id, _id: { $ne: proposal._id } },
      { status: 'rejected' }
    );

    res.json(proposal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reject proposal
router.put('/:id/reject', verifyToken, async (req, res) => {
  try {
    const proposal = await Proposal.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    res.json(proposal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;