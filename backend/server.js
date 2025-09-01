const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/vendors', require('./routes/vendors'));
app.use('/api/buyers', require('./routes/buyers'));
app.use('/api/products', require('./routes/products'));
app.use('/api/purchases', require('./routes/purchases'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/barcodes', require('./routes/barcodes'));

// PDF generation endpoints
app.get('/api/purchases/:id/invoice', async (req, res) => {
  try {
    const Purchase = require('./models/Purchase');
    const { generatePurchaseInvoice } = require('./utils/pdfGenerator');
    
    const purchase = await Purchase.findById(req.params.id)
      .populate('vendor', 'name contactPerson')
      .populate('items.product', 'name');
    
    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }
    
    const pdfBuffer = await generatePurchaseInvoice(purchase);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=purchase-${purchase.purchaseId}.pdf`
    });
    
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/sales/:id/invoice', async (req, res) => {
  try {
    const Sale = require('./models/Sale');
    const { generateSaleInvoice } = require('./utils/pdfGenerator');
    
    const sale = await Sale.findById(req.params.id)
      .populate('buyer', 'name phone')
      .populate('items.product', 'name')
      .populate('items.productItem', 'barcode');
    
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    
    const pdfBuffer = await generateSaleInvoice(sale);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=sale-${sale.saleId}.pdf`
    });
    
    res.send(pdfBuffer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ message: 'Server error' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});