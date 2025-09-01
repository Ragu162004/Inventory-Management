const express = require('express');
const router = express.Router();
const {
  getAllSales,
  getSaleById,
  createSale,
  scanBarcode
} = require('../controllers/saleController');

router.get('/', getAllSales);
router.get('/:id', getSaleById);
router.post('/', createSale);
router.post('/scan', scanBarcode);

module.exports = router;