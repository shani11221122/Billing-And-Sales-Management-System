const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const auth = require('../middleware/authMiddleware');

router.use(auth);

router.get('/', invoiceController.getInvoices);
router.post('/', invoiceController.addInvoice);
router.put('/:id', invoiceController.updateInvoice);
router.delete('/:id', invoiceController.deleteInvoice);

module.exports = router;