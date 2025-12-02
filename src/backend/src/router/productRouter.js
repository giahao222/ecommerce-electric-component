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

// GET /api/products/:slug  -> lấy chi tiết sản phẩm theo slug
router.get("/api/products/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;
    const product = await Product.findOne({ slug }).populate("category");

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.json(product);
  } catch (err) {
    console.error("Lỗi lấy chi tiết sản phẩm:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Lấy chi tiết sản phẩm theo slug
router.get("/api/products/slug/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    // nếu schema có field "slug"
    const product = await Product.findOne({ slug }).populate("category"); 

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Có thể trả thẳng product, JS đã có fallback
    res.json(product);

    // Nếu muốn gửi kèm tên & slug category rõ ràng:
    /*
    res.json({
      ...product.toObject(),
      categoryName: product.category?.name || "",
      categorySlug: product.category?.slug || "laptops",
    });
    */
  } catch (err) {
    console.error("Error get product by slug:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// rate product
router.post("/products/:id/rating", async (req, res) => {
  try {
    const { rating } = req.body;
    const productId = req.params.id;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating phải từ 1 đến 5" });
    }

    // Lấy product hiện tại
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    // Tính toán rating mới
    const currentAvg = product.rating_average || 0;
    const count = product.rating_count || 0;

    const newCount = count + 1;
    const newAverage = ((currentAvg * count) + rating) / newCount;

    // Lưu
    product.rating_average = newAverage;
    product.rating_count = newCount;

    await product.save();

    res.json({
      message: "Đánh giá thành công",
      rating_average: product.rating_average,
      rating_count: product.rating_count,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

router.get("/products/:id/rating", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .select("rating_average rating_count");

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Lỗi server" });
  }
});


module.exports = router;
