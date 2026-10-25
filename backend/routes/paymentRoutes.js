const express = require('express');
const router = express.Router();
const { processPayment, getPaymentById } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.post('/process', protect, processPayment);
router.get('/:id', protect, getPaymentById);

module.exports = router;
