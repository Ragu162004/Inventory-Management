const Sale = require('../models/Sale');
const Product = require('../models/Product');

// Get all sales
exports.getAllSales = async (req, res) => {
  try {
    console.log("Get all sales called");
    
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
    const { 
      buyer, 
      items, 
      saleDate, 
      subtotal,
      discount,
      discountAmount,
      tax,
      taxAmount,
      shipping,
      other,
      total
    } = req.body;
    
    // Group items by product and sum quantities
    const productMap = new Map();
    for (const item of items) {
      const key = item.product;
      if (!productMap.has(key)) {
        productMap.set(key, { ...item, quantity: item.quantity || 1 });
      } else {
        productMap.get(key).quantity += item.quantity || 1;
      }
    }
    
    const uniqueProductIds = Array.from(productMap.keys());
    const products = await Product.find({ _id: { $in: uniqueProductIds } });
    
    if (products.length !== uniqueProductIds.length) {
      return res.status(400).json({ message: 'Some products are not available' });
    }
    
    // Calculate totals and prepare sale items
    let totalAmount = 0;
    const saleItems = [];
    
    for (const productId of uniqueProductIds) {
      const item = productMap.get(productId);
      const product = products.find(p => p._id.toString() === productId);
      
      if (!product) {
        return res.status(400).json({ message: `Product with id ${productId} not found` });
      }
      
      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Product ${product.name} does not have enough stock` });
      }
      
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;
      
      saleItems.push({
        product: product._id,
        quantity: item.quantity,
        unitPrice: product.price,
        total: itemTotal,
        barcode: product.barcode
      });
      
      // Update product quantity
      await Product.findByIdAndUpdate(
        product._id,
        { $inc: { quantity: -item.quantity } }
      );
    }
    
    // Create sale with additional fields
    const sale = new Sale({
      buyer,
      items: saleItems,
      subtotal: subtotal || totalAmount,
      discount: discount || 0,
      discountAmount: discountAmount || 0,
      tax: tax || 0,
      taxAmount: taxAmount || 0,
      shipping: shipping || 0,
      other: other || 0,
      totalAmount: total || totalAmount,
      saleDate: saleDate || new Date()
    });
    
    const savedSale = await sale.save();
    const populatedSale = await Sale.findById(savedSale._id)
      .populate('buyer', 'name phone')
      .populate('items.product', 'name category barcode');
      
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
      product: {
        _id: product._id,
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        barcode: product.barcode
      },
      price: product.price,
      barcode: product.barcode,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Authenticate password for editing sales
exports.authenticateEdit = async (req, res) => {
  try {
    const { password } = req.body;
    // You can change this password as needed
    const EDIT_PASSWORD = "admin123"; // Change this to your desired password
    
    if (password === EDIT_PASSWORD) {
      res.json({ success: true, message: "Authentication successful" });
    } else {
      res.status(401).json({ success: false, message: "Invalid password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update sale
exports.updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      buyer, 
      items, 
      saleDate, 
      subtotal,
      discount,
      discountAmount,
      tax,
      taxAmount,
      shipping,
      other,
      total,
      comments
    } = req.body;

    // Find the existing sale
    const existingSale = await Sale.findById(id).populate('items.product');
    if (!existingSale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Restore stock for old items
    for (const item of existingSale.items) {
      await Product.findByIdAndUpdate(
        item.product._id,
        { $inc: { quantity: item.quantity } }
      );
    }

    // Process new items
    const productMap = new Map();
    for (const item of items) {
      const key = item.product;
      if (!productMap.has(key)) {
        productMap.set(key, { ...item, quantity: item.quantity || 1 });
      } else {
        productMap.get(key).quantity += item.quantity || 1;
      }
    }
    
    const uniqueProductIds = Array.from(productMap.keys());
    const products = await Product.find({ _id: { $in: uniqueProductIds } });
    
    if (products.length !== uniqueProductIds.length) {
      return res.status(400).json({ message: 'Some products are not available' });
    }
    
    // Calculate totals and prepare sale items
    let totalAmount = 0;
    const saleItems = [];
    
    for (const productId of uniqueProductIds) {
      const item = productMap.get(productId);
      const product = products.find(p => p._id.toString() === productId);
      
      if (!product) {
        return res.status(400).json({ message: `Product with id ${productId} not found` });
      }
      
      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Product ${product.name} does not have enough stock` });
      }
      
      const itemTotal = (item.unitPrice || product.price) * item.quantity;
      totalAmount += itemTotal;
      
      saleItems.push({
        product: product._id,
        quantity: item.quantity,
        unitPrice: item.unitPrice || product.price,
        total: itemTotal,
        barcode: item.barcode || product.barcode
      });
      
      // Update product quantity
      await Product.findByIdAndUpdate(
        product._id,
        { $inc: { quantity: -item.quantity } }
      );
    }

    // Update the sale
    const updatedSale = await Sale.findByIdAndUpdate(
      id,
      {
        buyer,
        items: saleItems,
        subtotal: subtotal || totalAmount,
        discount: discount || 0,
        discountAmount: discountAmount || 0,
        tax: tax || 0,
        taxAmount: taxAmount || 0,
        shipping: shipping || 0,
        other: other || 0,
        totalAmount: total || totalAmount,
        saleDate: saleDate || existingSale.saleDate,
        comments: comments || existingSale.comments
      },
      { new: true }
    ).populate('buyer', 'name phone email address')
     .populate('items.product', 'name description category barcode');

    res.json(updatedSale);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
};