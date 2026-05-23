const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const auth = require('../middleware/authMiddleware');

router.use(auth);

router.get('/', purchaseController.getPurchases);
router.post('/', purchaseController.addPurchase);
router.put('/:id', purchaseController.updatePurchase);
router.delete('/:id', purchaseController.deletePurchase);

module.exports = router;