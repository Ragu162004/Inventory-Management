const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');  

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getLowStockProducts
} = require('../controllers/productController');

router.get('/', getAllProducts);
router.get('/low-stock', getLowStockProducts);
router.get('/:id', getProductById);
router.post('/',productController.upload.single('photo'),productController.createProduct);
router.put('/:id', productController.upload.single('photo'), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;