const mongoose = require('mongoose');
const { Schema } = mongoose;

const UploadedProfitSheetSchema = new Schema({
  fileName: {
    type: String,
    required: true,
    trim: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  uploadedBy: {
    type: String,
    default: 'System'
  },
  totalRecords: {
    type: Number,
    default: 0
  },
  successRecords: {
    type: Number,
    default: 0
  },
  errorRecords: {
    type: Number,
    default: 0
  },
  profitSummary: {
    totalProfit: {
      type: Number,
      default: 0
    },
    deliveredProfit: {
      type: Number,
      default: 0
    },
    rtoProfit: {
      type: Number,
      default: 0
    },
    rpuProfit: {
      type: Number,
      default: 0
    },
    netProfit: {
      type: Number,
      default: 0
    }
  },
  uploadedData: [
    {
      comboId: String,
      comboName: String,
      productNames: String,
      quantity: Number,
      costPrice: Number,
      soldPrice: Number,
      profitPerUnit: Number,
      profitTotal: Number,
      status: {
        type: String,
        enum: ['delivered', 'rtu', 'rpu'],
        default: 'delivered'
      },
      date: Date,
      isProfit: Boolean
    }
  ],
  status: {
    type: String,
    enum: ['pending', 'processed', 'completed'],
    default: 'completed'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for better query performance
UploadedProfitSheetSchema.index({ uploadDate: -1 });
UploadedProfitSheetSchema.index({ fileName: 1 });
UploadedProfitSheetSchema.index({ status: 1 });

module.exports = mongoose.model('UploadedProfitSheet', UploadedProfitSheetSchema);