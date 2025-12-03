const express = require('express');
const router = express.Router();
const paymentController = require('../controller/paymentController');

// Hiển thị form thanh toán
router.get('/payment', paymentController.showPaymentPage);

// Tạo thanh toán
router.post('/create', paymentController.createPayment);

// Return URL từ VNPay
router.get('/vnpay_return', paymentController.vnpayReturn);

// IPN URL từ VNPay
router.get('/vnpay_ipn', paymentController.vnpayIPN);

module.exports = router;