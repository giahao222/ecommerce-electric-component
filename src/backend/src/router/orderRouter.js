const express = require("express");
const router = express.Router();
const orderController = require("../controller/orderController");
const authController = require("../middleware/authMiddleware");

// xác nhận thanh toán đơn hàng
router.post(
  "/confirm-pay",
  authController.authMiddleware,
  orderController.confilm_pay
);

// receive - hook từ payos
router.post("/receive-hook", orderController.receive_hook);

router.get(
  "/all-history-order-user",
  authController.authMiddleware,
  authController.checkRoleUser,
  orderController.get_all_history_transaction_order_all_user
);

// lấy thông tin order của 1 khách hàng
router.get(
  "/order-user",
  authController.authMiddleware,
  orderController.get_order_for_user
);

router.post("/create-order", authController.authMiddleware, orderController.createOrder);
module.exports = router;
