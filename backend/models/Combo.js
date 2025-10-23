const mongoose = require('mongoose');

const comboProductSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  }
}, { _id: false });

const comboSchema = new mongoose.Schema({
  comboId: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  barcode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  products: [comboProductSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  imageUrl: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Generate comboId before saving
comboSchema.pre('save', async function(next) {
  if (this.isNew && !this.comboId) {
    try {
      const count = await mongoose.model('Combo').countDocuments();
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      this.comboId = `COMBO-${timestamp}-${count + 1}-${random}`;
    } catch (error) {
      console.error('Error generating comboId:', error);
      // Fallback ID generation
      this.comboId = `COMBO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
  }
  next();
});

comboSchema.index({ barcode: 1 });
comboSchema.index({ name: 1 });

module.exports = mongoose.model('Combo', comboSchema);