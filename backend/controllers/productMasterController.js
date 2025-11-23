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
        const priceWithGST = row['Price/product with GST'] || row['Price with GST'] || row['price with gst'];

        // Validate required fields - only need data up to Price/product with GST
        if (!sNo || !productCategory || !sellingProductCode || !productName || pricePerProduct === undefined) {
          errors.push({
            row: i + 2, // Excel row number (header is row 1)
            error: 'Missing required fields (S.No, Product Category, Selling Product Code, Product Name, Price/product)',
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

        // Step 2: Check if selling product code already exists, skip if duplicate
        let existingCombo = await Combo.findOne({ barcode: comboCode });
        
        if (existingCombo) {
          // Skip - selling product code already exists
          continue;
        }
        
        // Create new combo - only selling product code matters
        const combo = new Combo({
          name: comboName,
          barcode: comboCode,
          price: comboPrice,
          category: category._id,
          description: `Imported from Excel - Category: ${categoryName}`
        });
        
        await combo.save();
        combosCreated.push(comboCode);

        processedData.push({
          sNo: Number(sNo),
          category: categoryName,
          comboCode: comboCode,
          comboName: comboName,
          price: comboPrice,
          priceWithGST: priceWithGST ? Number(priceWithGST) : (comboPrice * 1.18),
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


