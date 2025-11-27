const express = require("express");
const router = express.Router();
const cardController = require("../controller/cartController");
const authMiddleware = require("../middleware/authMiddleware");

// load giỏ hàng của 1 user
router.get(
  "/cart-user",
  authMiddleware.authMiddleware,
  cardController.get_card_for_user
);

// thêm 1 sản phẩm vào card của user
router.post(
  "/add-cart",
  authMiddleware.authMiddleware,
  cardController.add_product_to_cart
);
router.put(
  "/up-cart",
  authMiddleware.authMiddleware,
  cardController.update_cart_quantity
);
// xóa 1 sản phẩm trong giỏ hàng của user
router.delete(
  "/delete-cart",
  authMiddleware.authMiddleware,
  cardController.delete_product_in_cart
);

module.exports = router;
