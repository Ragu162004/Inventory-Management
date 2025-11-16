const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const mongoose = require('mongoose');
const Purchase = require('../models/Purchase');
const Sale = require('../models/Sale');
const Combo = require('../models/Combo');
const Product = require('../models/Product');
const UploadedProfitSheet = require('../models/UploadedProfitSheet');
const RTOProduct = require('../models/RTOProduct');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// GET profit/loss for date range from database
router.get('/', async (req, res) => {
  try {
    console.log('📊 GET /profit-loss endpoint called with query:', req.query);
    const { startDate, endDate } = req.query;

    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }

    console.log('🔍 Fetching sales data...');
    // Get sales data with status filtering
    const salesData = await Sale.aggregate([
      {
        $match: {
          ...(startDate || endDate
            ? {
                saleDate: {
                  ...(startDate && { $gte: new Date(startDate) }),
                  ...(endDate && {
                    $lte: new Date(new Date(endDate).setHours(23, 59, 59, 999)),
                  }),
                },
              }
            : {}),
        },
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      {
        $lookup: {
          from: 'combos',
          localField: 'items.combo',
          foreignField: '_id',
          as: 'comboDetails',
        },
      },
      {
        $project: {
          _id: 1,
          saleDate: 1,
          status: 1,
          itemType: '$items.type',
          quantity: '$items.quantity',
          unitPrice: '$items.unitPrice',
          total: '$items.total',
          productDetails: { $arrayElemAt: ['$productDetails', 0] },
          comboDetails: { $arrayElemAt: ['$comboDetails', 0] },
        },
      },
    ]);

    // Calculate profit by comparing with purchase cost
    const profitData = [];
    let totalProfit = 0;
    let deliveredProfit = 0;
    let rpuProfit = 0;

    for (const sale of salesData) {
      let costPrice = 0;

      try {
        // Get cost price from purchase data
        if (sale.itemType === 'product' && sale.productDetails) {
          // Find purchase record for this product
          const purchase = await Purchase.findOne(
            { 'items.product': sale.productDetails._id },
            { 'items.$': 1, totalAmount: 1 }
          );

          if (purchase && purchase.items && purchase.items[0]) {
            costPrice = purchase.items[0].unitCost;
          }
        } else if (sale.itemType === 'combo' && sale.comboDetails) {
          // For combos, sum the cost of all products in the combo
          const combo = await Combo.findById(sale.comboDetails._id).populate('products.product');
          if (combo && combo.products && combo.products.length > 0) {
            for (const comboProduct of combo.products) {
              const purchase = await Purchase.findOne(
                { 'items.product': comboProduct.product._id },
                { 'items.$': 1 }
              );
              if (purchase && purchase.items && purchase.items[0]) {
                costPrice += purchase.items[0].unitCost * comboProduct.quantity;
              }
            }
          } else {
            console.warn(`Combo ${sale.comboDetails._id} has no products or not found`);
          }
        }

        const profitPerUnit = sale.unitPrice - costPrice;
        let profitTotal = profitPerUnit * sale.quantity;

        // For RPU items, treat profit as negative
        const isRPU = sale.status === 'rpu' || sale.status === 'returned';
        if (isRPU) {
          profitTotal = -Math.abs(profitTotal);
        }

        const profitRecord = {
          saleId: sale._id,
          date: sale.saleDate,
          status: sale.status || 'delivered',
          itemType: sale.itemType,
          product: sale.productDetails?.name || sale.comboDetails?.name || 'Unknown',
          costPrice: costPrice,
          soldPrice: sale.unitPrice,
          quantity: sale.quantity,
          profitPerUnit: profitPerUnit,
          profitTotal: profitTotal,
        };

        profitData.push(profitRecord);

        if (isRPU) {
          rpuProfit += profitTotal;
        } else {
          deliveredProfit += profitTotal;
        }

        totalProfit += profitTotal;
      } catch (itemError) {
        console.error(`Error processing sale item ${sale._id}:`, itemError);
        // Continue processing other items instead of failing completely
      }
    }

    // Monthly breakdown
    const monthlyProfit = {};
    profitData.forEach(record => {
      const month = new Date(record.date).toISOString().split('T')[0].slice(0, 7);
      if (!monthlyProfit[month]) {
        monthlyProfit[month] = { deliveredProfit: 0, rpuProfit: 0, totalProfit: 0 };
      }

      if (record.status === 'rpu' || record.status === 'returned') {
        monthlyProfit[month].rpuProfit += record.profitTotal;
      } else {
        monthlyProfit[month].deliveredProfit += record.profitTotal;
      }
      monthlyProfit[month].totalProfit += record.profitTotal;
    });

    const monthlyChartData = Object.entries(monthlyProfit)
      .map(([month, data]) => ({
        month,
        deliveredProfit: data.deliveredProfit,
        rpuProfit: data.rpuProfit,
        totalProfit: data.totalProfit,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    console.log(`✅ Successfully fetched ${profitData.length} profit records`);
    res.json({
      profitData,
      monthlyChartData,
      summary: {
        totalProfit: Number(totalProfit.toFixed(2)),
        deliveredProfit: Number(deliveredProfit.toFixed(2)),
        rpuProfit: Number(rpuProfit.toFixed(2)),
        totalRecords: profitData.length,
      },
    });
  } catch (error) {
    console.error('❌ Error calculating profit/loss:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      message: error.message,
      details: 'Check backend logs for full error',
      error: error.toString()
    });
  }
});

// POST upload and process Excel file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    console.log('📤 POST /profit-loss/upload endpoint called');
    if (!req.file) {
      console.warn('⚠️ No file provided in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log(`📁 Received file: ${req.file.originalname} (${req.file.size} bytes)`);
    // Parse Excel file
    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      console.warn('⚠️ No data found in Excel file');
      return res.status(400).json({ message: 'No data found in Excel file' });
    }

    console.log(`📊 Excel file contains ${data.length} rows`);
    // Log available columns for debugging
    const firstRow = data[0];
    const availableColumns = Object.keys(firstRow || {});
    console.log('📋 Available columns in Excel:', availableColumns);

    const results = [];
    let totalProfit = 0;
    let deliveredProfit = 0;
    let rtoProfit = 0;
    let rpuProfit = 0;

    // Process each row
    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      try {
        const row = data[rowIndex];
        
        // Handle case-insensitive column names
        const rowKeys = Object.keys(row);
        const findColumn = (columnName) => {
          const key = rowKeys.find(k => k.toLowerCase() === columnName.toLowerCase());
          return row[key];
        };
        
        const ComboID = findColumn('ComboID');
        const SoldPrice = findColumn('SoldPrice');
        const Quantity = findColumn('Quantity');
        const Status = findColumn('Status');
        const PaymentDate = findColumn('PaymentDate');

        // Validation
        if (!ComboID || ComboID.toString().trim() === '') {
          results.push({
            comboId: 'Missing',
            status: 'Error',
            message: 'ComboID is required',
            rowNumber: rowIndex + 2, // +2 for header and 1-based indexing
          });
          continue;
        }

        if (!SoldPrice || isNaN(Number(SoldPrice)) || Number(SoldPrice) <= 0) {
          results.push({
            comboId: ComboID,
            status: 'Error',
            message: 'Invalid or missing SoldPrice (must be a positive number)',
            rowNumber: rowIndex + 2,
          });
          continue;
        }

        if (!Quantity || isNaN(Number(Quantity)) || Number(Quantity) <= 0) {
          results.push({
            comboId: ComboID,
            status: 'Error',
            message: 'Invalid or missing Quantity (must be a positive number)',
            rowNumber: rowIndex + 2,
          });
          continue;
        }

        // Find combo - try multiple identifiers
        let combo = await Combo.findOne({ comboId: ComboID.toString().trim() }).populate('products.product');
        
        if (!combo) {
          // Try searching by name if comboId lookup fails
          combo = await Combo.findOne({ name: ComboID.toString().trim() }).populate('products.product');
        }

        if (!combo) {
          results.push({
            comboId: ComboID,
            status: 'Error',
            message: `Combo "${ComboID}" not found in database`,
            rowNumber: rowIndex + 2,
          });
          continue;
        }

        // Validate combo has products
        if (!combo.products || combo.products.length === 0) {
          results.push({
            comboId: ComboID,
            status: 'Error',
            message: `Combo "${combo.name}" has no products assigned`,
            rowNumber: rowIndex + 2,
          });
          continue;
        }

        // Calculate cost price from combo products
        let costPrice = 0;
        const productsInCombo = [];

        for (const comboProduct of combo.products) {
          if (!comboProduct.product) {
            console.warn(`Product reference missing in combo ${combo.comboId}`);
            continue;
          }

          const purchase = await Purchase.findOne(
            { 'items.product': comboProduct.product._id },
            { 'items.$': 1 }
          );

          let unitCost = 0;
          if (purchase && purchase.items && purchase.items[0]) {
            unitCost = purchase.items[0].unitCost;
            costPrice += unitCost * comboProduct.quantity;
          }

          productsInCombo.push({
            productName: comboProduct.product.name,
            quantity: comboProduct.quantity,
            costPrice: unitCost,
          });
        }

        // Normalize quantity and prices
        const quantity = Number(Quantity);
        const soldPrice = Number(SoldPrice);
        
        // Calculate profit (costPrice is already the total cost per combo)
        const profitPerUnit = soldPrice - costPrice;
        let profitTotal = profitPerUnit * quantity;

        // Determine status - Support RTO, RPU, Delivered
        const statusLower = (Status || 'Delivered').toString().toLowerCase().trim();
        let normalizedStatus = 'delivered';
        
        if (statusLower === 'rtu' || statusLower === 'rto' || statusLower === 'return to origin') {
          normalizedStatus = 'rtu';
        } else if (statusLower === 'rpu' || statusLower === 'returned' || statusLower === 'return') {
          normalizedStatus = 'rpu';
        } else {
          normalizedStatus = 'delivered';
        }
        
        // For RTO/RPU items, treat profit as negative
        if (normalizedStatus === 'rpu' || normalizedStatus === 'rtu') {
          profitTotal = -Math.abs(profitTotal);
          if (normalizedStatus === 'rtu') {
            rtoProfit += profitTotal;
          } else {
            rpuProfit += profitTotal;
          }
        } else {
          deliveredProfit += profitTotal;
        }

        totalProfit += profitTotal;

        // Build product names string
        const productNames = productsInCombo.map(p => p.productName).join(', ');

        results.push({
          comboId: ComboID,
          comboName: combo.name,
          products: productsInCombo,
          productNames: productNames,
          costPrice: Number(costPrice.toFixed(2)),
          soldPrice: soldPrice,
          quantity: quantity,
          profitPerUnit: Number(profitPerUnit.toFixed(2)),
          profitTotal: Number(profitTotal.toFixed(2)),
          status: normalizedStatus,
          date: PaymentDate ? new Date(PaymentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          isProfit: profitTotal > 0,
        });
      } catch (error) {
        console.error(`Error processing row ${rowIndex + 2}:`, error);
        results.push({
          comboId: row?.ComboID || findColumn('ComboID') || 'Unknown',
          status: 'Error',
          message: error.message || 'Unknown error occurred',
          rowNumber: rowIndex + 2,
        });
      }
    }

    // Create RTOProduct records for RTO/RPU items
    const successResults = results.filter(r => r.status !== 'Error');
    
    for (const result of successResults) {
      if (result.status === 'rtu' || result.status === 'rpu') {
        try {
          // Create RTOProduct record for tracking
          const rtoProduct = new RTOProduct({
            product: new mongoose.Types.ObjectId(), // Placeholder since we don't have product ID
            productName: result.comboName || result.productNames,
            barcode: '',
            category: result.status === 'rtu' ? 'RTO' : 'RPU',
            quantity: result.quantity,
            price: result.soldPrice,
            totalValue: result.quantity * result.soldPrice,
            status: 'pending',
            addedBy: 'System (Auto Upload)',
            notes: `Imported from profit sheet on ${new Date().toISOString()}`
          });
          
          await rtoProduct.save();
          console.log(`✅ Created RTOProduct for ${result.comboName} (${result.status.toUpperCase()})`);
        } catch (err) {
          console.error(`⚠️ Error creating RTOProduct for ${result.comboName}:`, err.message);
          // Don't fail the entire upload if a single RTOProduct fails
        }
      }
    }

    // Return results with clear success/error indicators
    const successCount = successResults.length;
    const errorCount = results.filter(r => r.status === 'Error').length;

    console.log(`✅ Upload processing complete: ${successCount} success, ${errorCount} errors`);
    console.log(`💰 Profit Summary - Total: $${totalProfit.toFixed(2)}, Delivered: $${deliveredProfit.toFixed(2)}, RTO: $${rtoProfit.toFixed(2)}, RPU: $${rpuProfit.toFixed(2)}`);

    // Save to UploadedProfitSheet collection
    const uploadedSheet = new UploadedProfitSheet({
      fileName: req.file.originalname,
      totalRecords: data.length,
      successRecords: successCount,
      errorRecords: errorCount,
      profitSummary: {
        totalProfit: Number(totalProfit.toFixed(2)),
        deliveredProfit: Number(deliveredProfit.toFixed(2)),
        rtoProfit: Number(rtoProfit.toFixed(2)),
        rpuProfit: Number(rpuProfit.toFixed(2)),
        netProfit: Number(totalProfit.toFixed(2))
      },
      uploadedData: successResults,
      status: 'completed'
    });

    try {
      await uploadedSheet.save();
      console.log(`✅ Uploaded profit sheet saved with ID: ${uploadedSheet._id}`);
    } catch (saveError) {
      console.error('⚠️ Error saving uploaded profit sheet:', saveError);
      // Don't fail the upload if database save fails
    }

    res.json({
      results,
      summary: {
        totalProfit: Number(totalProfit.toFixed(2)),
        deliveredProfit: Number(deliveredProfit.toFixed(2)),
        rtoProfit: Number(rtoProfit.toFixed(2)),
        rpuProfit: Number(rpuProfit.toFixed(2)),
        totalRecords: successCount,
        errorRecords: errorCount,
      },
      uploadId: uploadedSheet._id
    });
  } catch (error) {
    console.error('❌ Error processing Excel file:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      message: error.message,
      details: error.toString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;