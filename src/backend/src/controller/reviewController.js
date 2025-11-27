const Product = require("../models/products");
const Review = require("../models/reviews");
const User = require("../models/users");

const get_all_review_for_products = async (req, res) => {
  try {
    const { product_id } = req.query;
    const reviews = await Review.findOne({ id_product: product_id })
    .populate({
      path: "information_review.id_user", // Populate thông tin của id_user
      select: "full_name", // Chỉ lấy trường name của user
    });
    res.status(200).json({
      message: "Success",
      data: reviews,
    });
  } catch (error) {
    console.log("Error fetching reviews:", error);
    res.status(500).json({ message: "Error fetching reviews" });
  }
};
const add_review_for_product = async (req, res) => {
  try {
    console.log("1");
    const { product_id, review_content, star } = req.body;
    const user_id = req.user._id;

    // Kiểm tra và tạo mới review nếu chưa tồn tại
    let review = await Review.findOne({ id_product: product_id });

    if (!review) {
      review = new Review({ id_product: product_id, information_review: [] });
    }

    // Thêm đánh giá mới vào danh sách đánh giá
    review.information_review.push({
      id_user: user_id,
      star,
      review_content,
    });

    await review.save();

    // Tìm sản phẩm cần cập nhật điểm đánh giá
    const product = await Product.findOne({ _id: product_id });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Tính toán lại điểm đánh giá trung bình
    const totalReviews = review.information_review.length;
    const totalStars = review.information_review.reduce(
      (sum, r) => sum + r.star,
      0
    );
    product.star = totalStars / totalReviews;

    await product.save();

    res.status(201).json({ message: "Review added successfully" });
  } catch (error) {
    console.error("Error adding review:", error);
    res
      .status(500)
      .json({ message: "Error adding review", error: error.message });
  }
};

const delete_review_user_for_product = async (req, res) => {
  try {
    const { product_id, review_id } = req.body;
    const user_id = req.user._id;
    // Tìm review của sản phẩm
    const review = await Review.findOne({ id_product: product_id });

    if (!review) {
      return res.status(404).json({ message: "Review not found for this product" });
    }

    // Tìm index của review cần xóa trong mảng information_review
    const reviewIndex = review.information_review.findIndex(
      (info) => info._id.toString() === review_id.toString() && info.id_user.toString() === user_id.toString()
    );

    if (reviewIndex === -1) {
      return res.status(404).json({ message: "Review not found for this user" });
    }

    // Xóa review trong mảng information_review
    review.information_review.splice(reviewIndex, 1);

    // Lưu lại review đã cập nhật
    await review.save();

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (error) {
    console.log("Error deleting review:", error);
    res.status(500).json({ message: "Error deleting review" });
  }
};


module.exports = {
  get_all_review_for_products,
  add_review_for_product,
  delete_review_user_for_product,
};