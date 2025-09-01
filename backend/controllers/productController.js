const Product = require('../models/Product');
const ProductItem = require('../models/ProductItem');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate('vendor', 'name contactPerson')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('vendor', 'name contactPerson phone');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new product
exports.createProduct = async (req, res) => {
  try {
    const BarcodeCounter = require('../models/BarcodeCounter');
    const prefix = 'IM001VP'; // You can make this dynamic if needed
    // Find and update the counter atomically
    const counter = await BarcodeCounter.findOneAndUpdate(
      { prefix },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const nextNumber = counter.seq;
    const barcode = `${prefix}${nextNumber.toString().padStart(4, '0')}`;

    const product = new Product({ ...req.body, barcode });
    const savedProduct = await product.save();

    // Generate barcode image for the product (optional: save or log the image)
    const { generateBarcode } = require('../config/barcodeGenerator');
    try {
      const barcodeImage = await generateBarcode(savedProduct.barcode);
      // Optionally, save barcodeImage to disk or database here
      // Example: fs.writeFileSync(`barcodes/${savedProduct.barcode}.png`, barcodeImage);
    } catch (barcodeErr) {
      console.error('Failed to generate barcode image:', barcodeErr);
    }

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Also delete all product items
    await ProductItem.deleteMany({ product: req.params.id });
    
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get low stock products
exports.getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      quantity: { $lte: { $ifNull: ['$reorderLevel', 5] } }
    }).populate('vendor', 'name');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};