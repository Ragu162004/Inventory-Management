const express = require('express');
const router = express.Router();
const productMasterController = require('../controllers/productMasterController');

// Upload Excel file (creates categories and combos automatically)
router.post('/upload', 
  productMasterController.upload.single('file'),
  productMasterController.uploadExcel
);

// Get all unmapped combos
router.get('/unmapped', productMasterController.getUnmappedCombos);

// Get upload statistics
router.get('/stats', productMasterController.getUploadStats);

// Get combo by code
router.get('/code/:code', productMasterController.getComboByCode);

// Map products to combo (manual mapping)
router.post('/map-products', productMasterController.mapProductsToCombo);

module.exports = router;
