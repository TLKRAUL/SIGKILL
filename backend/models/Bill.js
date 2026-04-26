const mongoose = require('mongoose');

const billSchema = new mongoose.Schema({
  provider: {
    type: String,
    required: true,
    trim: true,
  },
  service: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  dueDate: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['paid', 'unpaid', 'pending'],
    default: 'unpaid',
  },
  contractNumber: {
    type: String,
    default: '',
  },
  scanDate: {
    type: Date,
    default: Date.now,
  },
  imageUrl: {
    type: String,
    default: null,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
}, {
  timestamps: true,
});

billSchema.index({ user: 1, dueDate: -1 });

module.exports = mongoose.model('Bill', billSchema);
