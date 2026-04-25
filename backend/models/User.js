const mongoose = require('mongoose');

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
    dietaryRestrictions: [String], // ex: ['vegetarian', 'fara-gluten']
    allergies: [String],          // ex: ['lactoza', 'arahide']
    familySize: { type: Number, default: 1 },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
