const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require('../middleware/authMiddleware');

router.use(auth); // Protect all product routes

router.route('/')
  .get(productController.getProducts)
  .post(productController.createProduct);

router.route('/:id')
  .put(productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = router;
