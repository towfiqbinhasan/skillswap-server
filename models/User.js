const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  image: { type: String, default: '' },
  role: { type: String, enum: ['client', 'freelancer', 'admin'], default: 'client' },
  skills: [{ type: String }],
  bio: { type: String, default: '' },
  hourlyRate: { type: Number, default: 0 },
  isBlocked: { type: Boolean, default: false },
}, { timestamps: true, strict: false });



module.exports = mongoose.model('User', userSchema, 'user');