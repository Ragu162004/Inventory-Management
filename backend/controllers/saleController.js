// Update sale
exports.updateSale = async (req, res) => {
  try {
    const saleId = req.params.id;
    const { items, buyer, saleDate, subtotal, discount, discountAmount, tax, taxAmount, shipping, other, total } = req.body;

    // Find existing sale
    const sale = await Sale.findById(saleId);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    // Restore product quantities from previous sale items
    for (const prevItem of sale.items) {
      await Product.findByIdAndUpdate(prevItem.product, { $inc: { quantity: prevItem.quantity } });
    }

    // Prepare new sale items and update product quantities and prices
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
      // If price is changed, update product price
      let usedPrice = product.price;
      if (item.unitPrice && item.unitPrice !== product.price) {
        usedPrice = item.unitPrice;
        await Product.findByIdAndUpdate(product._id, { price: usedPrice });
      }
      const itemTotal = usedPrice * item.quantity;
      totalAmount += itemTotal;
      saleItems.push({
        product: product._id,
        quantity: item.quantity,
        unitPrice: usedPrice,
        total: itemTotal,
        barcode: product.barcode
      });
      // Deduct new quantity
      await Product.findByIdAndUpdate(product._id, { $inc: { quantity: -item.quantity } });
    }

    // Update sale fields
    sale.buyer = buyer;
    sale.items = saleItems;
    sale.subtotal = subtotal || totalAmount;
    sale.discount = discount || 0;
    sale.discountAmount = discountAmount || 0;
    sale.tax = tax || 0;
    sale.taxAmount = taxAmount || 0;
    sale.shipping = shipping || 0;
    sale.other = other || 0;
    sale.totalAmount = total || totalAmount;
    sale.saleDate = saleDate || new Date();

    await sale.save();
    const populatedSale = await Sale.findById(sale._id)
      .populate('buyer', 'name phone')
      .populate('items.product', 'name category barcode');
    res.json(populatedSale);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
};

// Delete sale
exports.deleteSale = async (req, res) => {
  try {
    const saleId = req.params.id;
    const sale = await Sale.findById(saleId);
    if (!sale) {
      return res.status(404).json({ message: 'Sale not found' });
    }
    // Restore product quantities for each item in sale
    for (const item of sale.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { quantity: item.quantity } });
    }
    await Sale.findByIdAndDelete(saleId);
    res.json({ message: 'Sale deleted and product quantities restored' });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: error.message });
  }
};
const Sale = require('../models/Sale');
const Product = require('../models/Product');

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