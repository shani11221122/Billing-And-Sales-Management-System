const express = require('express');
const router = express.Router();
const discountController = require('../controllers/discountController');
const auth = require('../middleware/authMiddleware');

router.use(auth);

router.get('/', discountController.getDiscounts);
router.post('/', discountController.addDiscount);
router.put('/:id', discountController.updateDiscount);
router.delete('/:id', discountController.deleteDiscount);

module.exports = router;