const express = require("express");
const router = express.Router();
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const productController = require("../controller/productController");

// lấy danh sách sản phẩm
router.get("/products", productController.get_all_products);
router.get("/hproducts", productController.get_newest_products);

router.get("/attribute",productController.get_all_attributes);
router.post("/add-attribute",productController.add_attribute);
router.put("/edit-attribute",productController.update_attribute);
router.delete("/delete-attribute",productController.delete_attribute);
// thêm 1 sản phẩm
router.post(
  "/add-product",
  upload.single("image"),
  productController.add_product
);

// xóa sản phẩm
router.delete("/delete-product", productController.delete_product_by_id);

// chỉnh sửa thông tin sản phẩm
router.put(
  "/edit-product",
  upload.single("image"),
  productController.put_product_by_id
);

// lấy thông tin sản phẩm bằng id
router.get("/product", productController.get_product_by_id);

// lấy thông tin sản phẩm bằng id
router.get("/search", productController.searchProduct);


module.exports = router;
