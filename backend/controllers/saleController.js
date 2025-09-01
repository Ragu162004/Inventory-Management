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
      .populate('items.product', 'name description category')
      .populate('items.productItem', 'barcode');
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
  const session = await Sale.startSession();
  session.startTransaction();
  
  try {
    const { buyer, items, saleDate } = req.body;
    
    // Verify all product items are available
    const productItems = await ProductItem.find({
      _id: { $in: items.map(item => item.productItem) },
      status: 'in_stock'
    }).session(session);
    
    if (productItems.length !== items.length) {
      throw new Error('Some items are not available or already sold');
    }
    
    // Calculate totals and prepare sale items
    let totalAmount = 0;
    const saleItems = [];
    
    for (const item of items) {
      const productItem = productItems.find(pi => pi._id.toString() === item.productItem);
      const itemTotal = productItem.sellingPrice;
      totalAmount += itemTotal;
      
      saleItems.push({
        productItem: item.productItem,
        product: productItem.product,
        unitPrice: productItem.sellingPrice,
        total: itemTotal
      });
      
      // Update product item status
      await ProductItem.findByIdAndUpdate(
        item.productItem,
        { status: 'sold', sale: null }, // Will be updated with sale ID after sale creation
        { session }
      );
      
      // Update product quantity
      await Product.findByIdAndUpdate(
        productItem.product,
        { $inc: { quantity: -1 } },
        { session }
      );
    }
    
    // Create sale
    const sale = new Sale({
      buyer,
      items: saleItems,
      totalAmount,
      saleDate: saleDate || new Date()
    });
    
    const savedSale = await sale.save({ session });
    
    // Update product items with sale reference
    await ProductItem.updateMany(
      { _id: { $in: items.map(item => item.productItem) } },
      { sale: savedSale._id },
      { session }
    );
    
    await session.commitTransaction();
    session.endSession();
    
    const populatedSale = await Sale.findById(savedSale._id)
      .populate('buyer', 'name phone')
      .populate('items.product', 'name category')
      .populate('items.productItem', 'barcode');
    
    res.status(201).json(populatedSale);
  } catch (error) {
    await session.abortTransaction();
    console.log(error.message)
    session.endSession();
    res.status(400).json({ message: error.message });
  }
};

// Scan barcode for sale
exports.scanBarcode = async (req, res) => {
  try {
    const { barcode } = req.body;
    
    const productItem = await ProductItem.findOne({ barcode, status: 'in_stock' })
      .populate('product', 'name description category price')
      .populate('purchase', 'purchaseDate');
    
    if (!productItem) {
      return res.status(404).json({ message: 'Product not found or already sold' });
    }
    
    res.json({
      productItem: productItem._id,
      product: productItem.product,
      barcode: productItem.barcode,
      price: productItem.sellingPrice
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};