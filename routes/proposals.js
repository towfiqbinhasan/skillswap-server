const express = require('express');
const router = express.Router();
const Proposal = require('../models/Proposal');
const Task = require('../models/Task');
const { verifyToken } = require('../middleware/verifyToken');

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

router.get('/freelancer/:email', verifyToken, async (req, res) => {
  try {
    const proposals = await Proposal.find({ freelancer_email: req.params.email })
      .populate('task_id', 'title budget status')
      .sort({ submitted_at: -1 });
    res.json(proposals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/task/:taskId', verifyToken, async (req, res) => {
  try {
    const proposals = await Proposal.find({ task_id: req.params.taskId });
    res.json(proposals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/accept', verifyToken, async (req, res) => {
  try {
    const proposal = await Proposal.findByIdAndUpdate(
      req.params.id, { status: 'accepted' }, { new: true }
    );
    res.json(proposal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/reject', verifyToken, async (req, res) => {
  try {
    const proposal = await Proposal.findByIdAndUpdate(
      req.params.id, { status: 'rejected' }, { new: true }
    );
    res.json(proposal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;