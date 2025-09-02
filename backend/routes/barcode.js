const express = require('express');
const router = express.Router();
const { generateVPFashionsBarcode } = require('../config/barcodeGenerator');
const Product = require('../models/Product');

// GET /api/products/:barcode/barcode-image
router.get('/:barcode/barcode-image', async (req, res) => {
  try {
    const barcode = req.params.barcode;
    const response = await Product.findOne({ barcode });
    const imageBuffer = await generateVPFashionsBarcode(response.name, barcode);
    res.set('Content-Type', 'image/png');
    res.send(imageBuffer);
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate barcode image' });
  }
});

module.exports = router;
