const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');
const Task = require('../models/Task');
const Proposal = require('../models/Proposal');
const { verifyToken } = require('../middleware/verifyToken');

// Stripe Checkout Session বানানো
router.post('/create-checkout-session', verifyToken, async (req, res) => {
  try {
    const { task_id, freelancer_email, amount, task_title } = req.body;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: task_title },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/dashboard/client`,
      metadata: { task_id, freelancer_email, client_email: req.user.email }
    });

    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Payment confirm করা
router.get('/confirm-session', verifyToken, async (req, res) => {
  try {
    const { session_id } = req.body;
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed' });
    }

    const { task_id, freelancer_email, client_email } = session.metadata;

    // Payment save করা
    const existing = await Payment.findOne({ transaction_id: session.payment_intent });
    if (!existing) {
      await Payment.create({
        client_email,
        freelancer_email,
        task_id,
        amount: session.amount_total / 100,
        transaction_id: session.payment_intent,
        payment_status: 'completed',
        paid_at: new Date()
      });

      // Task status update
      await Task.findByIdAndUpdate(task_id, { status: 'in-progress' });
    }

    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// সব payments (Admin)
router.get('/all', verifyToken, async (req, res) => {
  try {
    const payments = await Payment.find().sort({ paid_at: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Freelancer earnings
router.get('/earnings/:email', verifyToken, async (req, res) => {
  try {
    const payments = await Payment.find({
      freelancer_email: req.params.email,
      payment_status: 'completed'
    }).populate('task_id', 'title').sort({ paid_at: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
// Client er payments
router.get('/client/:email', verifyToken, async (req, res) => {
  try {
    const payments = await Payment.find({
      client_email: req.params.email,
      payment_status: 'completed'
    }).sort({ paid_at: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
