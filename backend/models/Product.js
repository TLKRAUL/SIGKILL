const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Numele produsului este obligatoriu'],
    trim: true,
  },
  category: {
    type: String,
    enum: ['Lactate', 'Fructe', 'Legume', 'Carne', 'Panificație', 'Băuturi', 'Conserve', 'Condimente', 'Dulciuri', 'Altele'],
    default: 'Altele',
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 0,
  },
  unit: {
    type: String,
    enum: ['buc', 'kg', 'g', 'L', 'ml'],
    default: 'buc',
  },
  price: {
    type: Number,
    default: 0,
    min: 0,
  },
  expiryDate: {
    type: Date,
    default: null,
  },
  addedDate: {
    type: Date,
    default: Date.now,
  },
  receipt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Receipt',
    default: null,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  isConsumed: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Virtual: zile până la expirare
productSchema.virtual('daysUntilExpiry').get(function () {
  if (!this.expiryDate) return null;
  const now = new Date();
  const diff = Math.ceil((this.expiryDate - now) / (1000 * 60 * 60 * 24));
  return diff;
});

// Index pentru queries rapide
productSchema.index({ category: 1 });
productSchema.index({ expiryDate: 1 });
productSchema.index({ user: 1 });

// Asigură că virtuals sunt incluse în JSON
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
