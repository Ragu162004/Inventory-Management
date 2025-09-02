const Product = require('../models/Product');
const ProductItem = require('../models/ProductItem');
const cloudinary = require('../config/cloudinary');

const multer = require('multer');
const path = require('path');
const storage = multer.memoryStorage();

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
    const prefix = 'IM001VP';
    const counter = await BarcodeCounter.findOneAndUpdate(
      { prefix },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const nextNumber = counter.seq;
    const barcode = `${prefix}${nextNumber.toString().padStart(4, '0')}`;

    // Upload image if provided
    let imageUrl = null;
    if (req.file) {
      try {
        // Convert buffer to base64 string for Cloudinary upload
        const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        
        const uploadResponse = await cloudinary.uploader.upload(fileStr, {
          folder: 'inventory-products',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto' }
          ]
        });

        imageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ message: 'Image upload failed' });
      }
    }

    const product = new Product({ ...req.body, barcode, image: imageUrl });
    const savedProduct = await product.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};  

// Update product
exports.updateProduct = async (req, res) => {
  try {
    let updateData = { ...req.body };
    
    // Upload new image if provided
    if (req.file) {
      try {
        // Convert buffer to base64 string for Cloudinary upload
        const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
        
        const uploadResponse = await cloudinary.uploader.upload(fileStr, {
          folder: 'inventory-products',
          transformation: [
            { width: 800, height: 600, crop: 'limit' },
            { quality: 'auto' }
          ]
        });

        updateData.image = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({ message: 'Image upload failed' });
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
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
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Delete image from Cloudinary if it exists
    if (product.image) {
      try {
        // Extract public_id from Cloudinary URL
        const urlParts = product.image.split('/');
        const filename = urlParts[urlParts.length - 1];
        const publicId = `inventory-products/${filename.split('.')[0]}`;
        
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryError) {
        console.error('Failed to delete image from Cloudinary:', cloudinaryError);
        // Continue with product deletion even if image deletion fails
      }
    }
    
    // Delete the product
    await Product.findByIdAndDelete(req.params.id);
    
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
      $expr: { $lte: ['$quantity', '$minquantity'] }
    }).populate('vendor', 'name');
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//upload handle
exports.upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only jpeg, jpg, png files are allowed!'), false);
    }
  }
});
