const mongoose = require('mongoose');

const buyerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: false
  },
  phone: {
    type: String,
    required: false,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Buyer', buyerSchema);