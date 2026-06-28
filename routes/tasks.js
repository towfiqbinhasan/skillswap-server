const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { verifyToken } = require('../middleware/verifyToken');

// সব open tasks (Browse Tasks page)
router.get('/', async (req, res) => {
  try {
    const { search, category, page = 1, limit = 9 } = req.query;
    const query = { status: 'open' };

    if (search) query.title = { $regex: search, $options: 'i' };
    if (category) query.category = category;

    const total = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ tasks, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Latest 6 tasks (Home page)
router.get('/latest', async (req, res) => {
  try {
    const tasks = await Task.find({ status: 'open' }).sort({ createdAt: -1 }).limit(6);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Single task
router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Client এর সব tasks
router.get('/client/:email', verifyToken, async (req, res) => {
  try {
    const tasks = await Task.find({ client_email: req.params.email }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Task বানানো
router.post('/', verifyToken, async (req, res) => {
  try {
    const task = await Task.create(req.body);
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Task update
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Task delete
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;