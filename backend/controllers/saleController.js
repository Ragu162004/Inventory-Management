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

    // Only update sale record, do not change product stock
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
        // Calculate available stock after restoring previous sale quantities
        const prevItem = sale.items.find(i => i.product.toString() === productId);
        const prevQty = prevItem ? prevItem.quantity : 0;
        const availableStock = product.quantity + prevQty;
        if (item.quantity > availableStock) {
          return res.status(400).json({ message: `Product ${product.name} does not have enough stock. Available: ${availableStock}` });
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
    // Deduct new quantity, but never allow stock to go negative
    const newStock = availableStock - item.quantity;
    await Product.findByIdAndUpdate(product._id, { quantity: Math.max(newStock, 0) });
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
      .populate('items.product', 'name category barcode')
      .populate({
        path: 'items.combo',
        select: 'name description barcode price products',
        populate: {
          path: 'products.product',
          select: 'name barcode price'
        }
      });
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
const Combo = require('../models/Combo');

// Get all sales
exports.getAllSales = async (req, res) => {
  try {    
    const sales = await Sale.find()
      .populate('buyer', 'name phone')
      .populate('items.product', 'name category')
      .populate({
        path: 'items.combo',
        select: 'name description barcode price products',
        populate: {
          path: 'products.product',
          select: 'name barcode price'
        }
      })
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
      .populate('items.product', 'name description category barcode')
      .populate({
        path: 'items.combo',
        select: 'name description barcode price products',
        populate: {
          path: 'products.product',
          select: 'name barcode price'
        }
      });
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
    
    // Process all items to handle both products and combos
    const productDeductions = new Map(); // Track total deductions per product
    const saleItems = [];
    let totalAmount = 0;
    
    for (const item of items) {
      if (item.type === 'combo') {
        // Handle combo item
        const combo = await Combo.findById(item.combo).populate('products.product');
        if (!combo) {
          return res.status(400).json({ message: `Combo with id ${item.combo} not found` });
        }
        
        // Check stock for all combo products
        for (const comboProduct of combo.products) {
          const requiredQty = comboProduct.quantity * (item.quantity || 1);
          const currentDeduction = productDeductions.get(comboProduct.product._id.toString()) || 0;
          const totalRequired = currentDeduction + requiredQty;
          
          if (comboProduct.product.quantity < totalRequired) {
            return res.status(400).json({ 
              message: `Product ${comboProduct.product.name} in combo ${combo.name} does not have enough stock. Required: ${totalRequired}, Available: ${comboProduct.product.quantity}` 
            });
          }
          
          // Track the deduction
          productDeductions.set(comboProduct.product._id.toString(), totalRequired);
        }
        
        const itemTotal = combo.price * (item.quantity || 1);
        totalAmount += itemTotal;
        
        // Add combo as sale item
        saleItems.push({
          type: 'combo',
          combo: combo._id,
          comboName: combo.name,
          quantity: item.quantity || 1,
          unitPrice: combo.price,
          total: itemTotal,
          barcode: combo.barcode
        });
        
      } else {
        // Handle regular product item
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(400).json({ message: `Product with id ${item.product} not found` });
        }
        
        const requiredQty = item.quantity || 1;
        const currentDeduction = productDeductions.get(product._id.toString()) || 0;
        const totalRequired = currentDeduction + requiredQty;
        
        if (product.quantity < totalRequired) {
          return res.status(400).json({ 
            message: `Product ${product.name} does not have enough stock. Required: ${totalRequired}, Available: ${product.quantity}` 
          });
        }
        
        // Track the deduction
        productDeductions.set(product._id.toString(), totalRequired);
        
        const itemTotal = (item.unitPrice || product.price) * requiredQty;
        totalAmount += itemTotal;
        
        saleItems.push({
          type: 'product',
          product: product._id,
          quantity: requiredQty,
          unitPrice: item.unitPrice || product.price,
          total: itemTotal,
          barcode: product.barcode
        });
      }
    }
    
    // Apply all product deductions
    for (const [productId, quantity] of productDeductions.entries()) {
      await Product.findByIdAndUpdate(productId, { $inc: { quantity: -quantity } });
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
    
    // Populate the sale differently based on item types
    const populatedSale = await Sale.findById(savedSale._id)
      .populate('buyer', 'name phone')
      .populate({
        path: 'items.product',
        select: 'name category barcode'
      })
      .populate({
        path: 'items.combo',
        select: 'name barcode',
        populate: {
          path: 'products.product',
          select: 'name barcode'
        }
      });
      
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
    
    // First try to find a product with this barcode
    const product = await Product.findOne({ barcode }).populate('category', 'name code');
    if (product) {
      return res.json({
        type: 'product',
        product: {
          _id: product._id,
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price,
          barcode: product.barcode,
          quantity: product.quantity
        },
        price: product.price,
        barcode: product.barcode,
      });
    }
    
    // If no product found, try to find a combo with this barcode
    const combo = await Combo.findOne({ barcode, isActive: true })
      .populate('products.product', 'name price barcode quantity');
    
    if (combo) {
      // Check if all combo products have sufficient stock
      const insufficientStock = [];
      for (const comboProduct of combo.products) {
        if (comboProduct.product.quantity < comboProduct.quantity) {
          insufficientStock.push({
            name: comboProduct.product.name,
            required: comboProduct.quantity,
            available: comboProduct.product.quantity
          });
        }
      }
      
      if (insufficientStock.length > 0) {
        return res.status(400).json({ 
          message: 'Insufficient stock for combo items',
          insufficientStock
        });
      }
      
      return res.json({
        type: 'combo',
        combo: {
          _id: combo._id,
          name: combo.name,
          description: combo.description,
          price: combo.price,
          barcode: combo.barcode,
          products: combo.products.map(cp => ({
            product: cp.product,
            quantity: cp.quantity
          }))
        },
        price: combo.price,
        barcode: combo.barcode,
      });
    }
    
    return res.status(404).json({ message: 'Product or combo not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};