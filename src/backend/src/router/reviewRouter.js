const express = require("express");
const router = express.Router();
const authController = require("../middleware/authMiddleware");
const reviewController = require("../controller/reviewController");

// lấy review của một sản phẩm
router.get("/reviews",  reviewController.get_all_review_for_products);

// thêm 1 review của một sản phẩm
router.post("/review", authController.authMiddleware, reviewController.add_review_for_product);

// xóa review của user trong một sản phẩm
router.delete("/review", authController.authMiddleware, reviewController.delete_review_user_for_product);

module.exports = router