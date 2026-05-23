const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const auth = require('../middleware/authMiddleware');

router.use(auth); // Protect sales routes

router.route('/')
  .get(salesController.getSales)
  .post(salesController.createSale);

router.get('/stats', salesController.getSalesStats);

module.exports = router;
