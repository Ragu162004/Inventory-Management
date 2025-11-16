const Category = require('../models/Category');
const Combo = require('../models/Combo');
const Product = require('../models/Product');
const xlsx = require('xlsx');
const multer = require('multer');

const storage = multer.memoryStorage();

// Multer upload middleware for Excel files
exports.upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /xlsx|xls/;
    const mimetype = /spreadsheet|excel/;
    if (filetypes.test(file.originalname.split('.').pop().toLowerCase()) || mimetype.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files (.xlsx, .xls) are allowed!'), false);
    }
  }
});

// Upload and process Excel file
exports.uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Parse Excel file
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    if (!jsonData || jsonData.length === 0) {
      return res.status(400).json({ message: 'Excel file is empty or invalid' });
    }

    // Process and validate data
    const processedData = [];
    const errors = [];
    const categoriesCreated = [];
    const combosCreated = [];
    const combosUpdated = [];
    
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      try {
        // Map Excel columns to schema fields (case-insensitive matching)
        const sNo = row['S.No.'] || row['S.No'] || row['SNo'] || row['sno'];
        const productCategory = row['Product Category'] || row['ProductCategory'] || row['product category'];
        const sellingProductCode = row['Selling Product Code'] || row['SellingProductCode'] || row['selling product code'];
        const productName = row['Product Name'] || row['ProductName'] || row['product name'];
        const pricePerProduct = row['Price/product'] || row['Price per product'] || row['price/product'] || row['Price'];

        // Validate required fields
        if (!sNo || !productCategory || !sellingProductCode || !productName || pricePerProduct === undefined) {
          errors.push({
            row: i + 2, // Excel row number (header is row 1)
            error: 'Missing required fields',
            data: row
          });
          continue;
        }

        const categoryName = String(productCategory).trim();
        const comboCode = String(sellingProductCode).trim();
        const comboName = String(productName).trim();
        const comboPrice = Number(pricePerProduct);

        // Step 1: Find or create category
        let category = await Category.findOne({ name: categoryName });
        
        if (!category) {
          // Generate a unique 3-digit code for the category
          const categoryCount = await Category.countDocuments();
          const categoryCode = String(categoryCount + 1).padStart(3, '0');
          
          category = new Category({
            name: categoryName,
            code: categoryCode,
            description: `Auto-created from Excel upload`
          });
          
          await category.save();
          categoriesCreated.push(category.name);
        }

        // Step 2: Find or create combo and auto-map to category
        let combo = await Combo.findOne({ barcode: comboCode });
        
        if (combo) {
          // Update existing combo
          combo.name = comboName;
          combo.price = comboPrice;
          combo.category = category._id; // Auto-map category
          combo.isMapped = false; // Products remain unmapped by default
          await combo.save();
          combosUpdated.push(comboCode);
        } else {
          // Create new combo with auto-mapped category
          combo = new Combo({
            name: comboName,
            barcode: comboCode,
            price: comboPrice,
            category: category._id, // Auto-map category
            products: [], // Empty by default - user will manually map
            isMapped: false, // Products unmapped by default
            description: `Imported from Excel - Category: ${categoryName}`
          });
          
          await combo.save();
          combosCreated.push(comboCode);
        }

        processedData.push({
          sNo: Number(sNo),
          category: categoryName,
          comboCode: comboCode,
          comboName: comboName,
          price: comboPrice,
          action: combo.isNew ? 'created' : 'updated'
        });

      } catch (error) {
        errors.push({
          row: i + 2,
          error: error.message,
          data: row
        });
      }
    }

    res.status(200).json({
      message: 'Excel file processed successfully',
      totalRows: jsonData.length,
      successCount: processedData.length,
      errorCount: errors.length,
      categoriesCreated: categoriesCreated.length,
      combosCreated: combosCreated.length,
      combosUpdated: combosUpdated.length,
      processedData,
      errors,
      summary: {
        categories: categoriesCreated,
        newCombos: combosCreated,
        updatedCombos: combosUpdated
      }
    });
  } catch (error) {
    console.error('Error processing Excel file:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all unmapped combos (combos where products are not mapped)
exports.getUnmappedCombos = async (req, res) => {
  try {
    const unmappedCombos = await Combo.find({ isMapped: false })
      .populate('category', 'name code')
      .sort({ createdAt: -1 });
    
    res.json({
      unmappedCombos,
      totalUnmapped: unmappedCombos.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get combo by barcode/code
exports.getComboByCode = async (req, res) => {
  try {
    const combo = await Combo.findOne({ barcode: req.params.code })
      .populate('category', 'name code')
      .populate('products.product', 'name price barcode');
    
    if (!combo) {
      return res.status(404).json({ message: 'Combo not found' });
    }
    
    res.json(combo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Map products to combo (manual mapping)
exports.mapProductsToCombo = async (req, res) => {
  try {
    const { comboId, products } = req.body;
    
    if (!comboId || !products || !Array.isArray(products)) {
      return res.status(400).json({ message: 'Combo ID and products array are required' });
    }

    const combo = await Combo.findById(comboId);
    
    if (!combo) {
      return res.status(404).json({ message: 'Combo not found' });
    }

    // Validate all products exist
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: `Product ${item.product} not found` });
      }
    }

    // Update combo with mapped products
    combo.products = products;
    combo.isMapped = products.length > 0;
    await combo.save();

    const populatedCombo = await Combo.findById(comboId)
      .populate('category', 'name code')
      .populate('products.product', 'name price barcode');

    res.json({
      message: 'Products mapped to combo successfully',
      combo: populatedCombo
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get upload statistics
exports.getUploadStats = async (req, res) => {
  try {
    const totalCombos = await Combo.countDocuments();
    const mappedCombos = await Combo.countDocuments({ isMapped: true });
    const unmappedCombos = await Combo.countDocuments({ isMapped: false });
    const totalCategories = await Category.countDocuments();

    res.json({
      totalCombos,
      mappedCombos,
      unmappedCombos,
      totalCategories
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
