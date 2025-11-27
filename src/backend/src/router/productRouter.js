const express = require("express");
const router = express.Router();
const multer = require("multer");
const Product = require('../models/products');
const Category = require('../models/categories');

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

// GET /api/products/category/:slug  (vd: /api/products/category/laptops)
router.get('/api/products/category/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;       // 'laptops', 'desktops', 'components'

    // Vì Category schema của bạn hiện chỉ có 'name' (Laptops/Desktops/Components)
    // nên mình map slug -> Name (chữ cái đầu viết hoa)
    const displayName = slug.charAt(0).toUpperCase() + slug.slice(1); // laptops -> Laptops

    const category = await Category.findOne({
      name: new RegExp(`^${displayName}$`, 'i'), // tìm theo name, không phân biệt hoa thường
    });

    if (!category) {
      console.warn('Không tìm thấy category cho slug:', slug);
      return res.json([]); // Không có category -> trả mảng rỗng
    }

    // Giả sử Product có field category: ObjectId ref tới categories
    const products = await Product.find({ category: category._id }).lean();

    return res.json(products);
  } catch (err) {
    console.error('🔥 Lỗi API /api/products/category/:slug', err);
    return res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
