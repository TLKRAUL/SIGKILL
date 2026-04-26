const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Numele este obligatoriu'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email-ul este obligatoriu'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Email invalid'],
  },
  password: {
    type: String,
    required: [true, 'Parola este obligatorie'],
    minlength: [6, 'Parola trebuie să aibă cel puțin 6 caractere'],
  },
  preferences: {
    dietaryRestrictions: [String],
    allergies: [String],
    familySize: { type: Number, default: 1 },
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'smart_saver', 'family_cfo', 'enterprise'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['trial', 'active', 'expired', 'pending'],
      default: 'trial',
    },
    trialEndsAt: {
      type: Date,
      default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // +3 zile
    },
    subscribedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },
    seats: { type: Number, default: 1 }, // pentru Enterprise
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check if trial is active
userSchema.methods.isTrialActive = function () {
  return this.subscription.status === 'trial' && this.subscription.trialEndsAt > new Date();
};

// Check if subscription is valid
userSchema.methods.hasActiveSubscription = function () {
  if (this.isTrialActive()) return true;
  if (this.subscription.status === 'active') {
    if (!this.subscription.expiresAt) return true;
    return this.subscription.expiresAt > new Date();
  }
  return false;
};

module.exports = mongoose.model('User', userSchema);
