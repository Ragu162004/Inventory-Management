const Sale = require('../models/Sale');
const Product = require('../models/Product');
const ProductItem = require('../models/ProductItem');

// Get all sales
exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sale.find()
      .populate('buyer', 'name phone')
      .populate('items.product', 'name category')
      .sort({ saleDate: -1 });
      console.log(sales);
    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get sale by ID
exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('buyer', 'name phone email address')
      .populate('items.product', 'name description category barcode');
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    res.json(sale);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new sale
exports.createSale = async (req, res) => {
  try {
    const { buyer, items, saleDate } = req.body;
    // Check all products exist and have enough quantity
    const productIds = items.map(item => item.product);
    const products = await Product.find({ _id: { $in: productIds } });
    if (products.length !== items.length) {
      return res.status(400).json({ message: 'Some products are not available' });
    }
    // Calculate totals and prepare sale items
    let totalAmount = 0;
    const saleItems = [];
    for (const item of items) {
      const product = products.find(p => p._id.toString() === item.product);
      if (!product) {
        return res.status(400).json({ message: `Product with id ${item.product} not found` });
      }
      if (product.quantity < 1) {
        return res.status(400).json({ message: `Product ${product.name} is out of stock` });
      }
      const itemTotal = product.price;
      totalAmount += itemTotal;
      saleItems.push({
        product: product._id,
        unitPrice: product.price,
        total: itemTotal
      });
      // Update product quantity
      await Product.findByIdAndUpdate(
        product._id,
        { $inc: { quantity: -1 } }
      );
    }
    // Create sale
    const sale = new Sale({
      buyer,
      items: saleItems,
      totalAmount,
      saleDate: saleDate || new Date()
    });
    const savedSale = await sale.save();
    const populatedSale = await Sale.findById(savedSale._id)
      .populate('buyer', 'name phone')
      .populate('items.product', 'name category');
    res.status(201).json(populatedSale);
  } catch (error) {
    console.log(error.message)
    res.status(400).json({ message: error.message });
  }
};

// Scan barcode for sale
exports.scanBarcode = async (req, res) => {
  try {
    const { barcode } = req.body;
    const product = await Product.findOne({ barcode });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({
      product: product._id,
      name: product.name,
      description: product.description,
      category: product.category,
      price: product.price,
      barcode: product.barcode
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};