const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  companyName: String,
  logo: String,
  address: String,
  phone: String,
  siret: String,
  tva: String,
  iban: String,
  bic: String,
  preferences: {
    defaultTemplate: {
      type: String,
      default: 'default'
    },
    language: {
      type: String,
      default: 'fr'
    },
    currency: {
      type: String,
      default: 'EUR'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Méthode pour mettre à jour le profil
userSchema.methods.updateProfile = async function(profileData) {
  const updatableFields = [
    'companyName', 'logo', 'address', 'phone',
    'siret', 'tva', 'iban', 'bic', 'preferences'
  ];

  updatableFields.forEach(field => {
    if (profileData[field] !== undefined) {
      this[field] = profileData[field];
    }
  });

  return this.save();
};

module.exports = mongoose.model('User', userSchema); 