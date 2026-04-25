const mongoose = require('mongoose');

const receiptItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unit: { type: String, default: 'buc' },
  price: { type: Number, default: 0 },
  category: { type: String, default: 'Altele' },
}, { _id: false });

const receiptSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    default: null,
  },
  storeName: {
    type: String,
    trim: true,
    default: 'Necunoscut',
  },
  totalAmount: {
    type: Number,
    default: 0,
    min: 0,
  },
  items: [receiptItemSchema],
  scanDate: {
    type: Date,
    default: Date.now,
  },
  rawText: {
    type: String,
    default: '',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  processed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

receiptSchema.index({ user: 1, scanDate: -1 });

module.exports = mongoose.model('Receipt', receiptSchema);
