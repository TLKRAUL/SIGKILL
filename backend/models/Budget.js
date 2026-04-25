const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  year: {
    type: Number,
    required: true,
  },
  limit: {
    type: Number,
    required: [true, 'Limita bugetului este obligatorie'],
    min: 0,
  },
  spent: {
    type: Number,
    default: 0,
    min: 0,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  receipts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Receipt',
  }],
}, {
  timestamps: true,
});

// Virtual: cât mai poți cheltui
budgetSchema.virtual('remaining').get(function () {
  return Math.max(0, this.limit - this.spent);
});

// Virtual: procentaj cheltuit
budgetSchema.virtual('percentUsed').get(function () {
  if (this.limit === 0) return 0;
  return Math.round((this.spent / this.limit) * 100);
});

budgetSchema.set('toJSON', { virtuals: true });
budgetSchema.set('toObject', { virtuals: true });

// Index unic per user/lună/an
budgetSchema.index({ user: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
