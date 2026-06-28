const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, enum: ['Design', 'Writing', 'Development', 'Marketing', 'Other'], required: true },
  description: { type: String, required: true },
  budget: { type: Number, required: true },
  deadline: { type: Date, required: true },
  client_email: { type: String, required: true },
  status: { type: String, enum: ['open', 'in-progress', 'completed'], default: 'open' },
  deliverable_url: { type: String, default: '' },
}, { timestamps: true });



module.exports = mongoose.model('Task', taskSchema);