const express = require('express');
const router = express.Router();
const {
  getAllSales,
  getSaleById,
  createSale,
  scanBarcode,
  authenticateEdit,
  updateSale
} = require('../controllers/saleController');

router.get('/', getAllSales);
router.get('/:id', getSaleById);
router.post('/', createSale);
router.post('/scan', scanBarcode);
router.post('/authenticate-edit', authenticateEdit);
router.put('/:id', updateSale);

module.exports = router;