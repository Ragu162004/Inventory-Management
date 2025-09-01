const mongoose = require('mongoose');


const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  }, 
  barcode: {
    type: String,
    required: true,
    unique: true
  },


  description: {
    type: String,
    trim: true
  },


  category: {
    type: String,
    required: true,
    trim: true
  },


  price: {
    type: Number,
    required: true,
    min: 0
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    min: 0,
    default: 0
  },
  reorderLevel: {
    type: Number,
    default: 5
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);