const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const auth = require('../middleware/authMiddleware');

router.use(auth);

router.route('/')
  .get(customerController.getCustomers)
  .post(customerController.createCustomer);

router.route('/:id')
  .put(customerController.updateCustomer)
  .delete(customerController.deleteCustomer);

module.exports = router;
