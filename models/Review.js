const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  task_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
  reviewer_email: { type: String, required: true },
  reviewee_email: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});



module.exports = mongoose.model('Review', reviewSchema);