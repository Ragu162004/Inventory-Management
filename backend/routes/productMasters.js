const express = require('express');
const router = express.Router();
const productMasterController = require('../controllers/productMasterController');

// Upload Excel file (creates categories and combos automatically)
router.post('/upload', 
  productMasterController.upload.single('file'),
  productMasterController.uploadExcel
);

module.exports = router;
