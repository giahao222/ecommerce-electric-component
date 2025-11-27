const mongoose = require("mongoose");

// Schema con cho từng mục trong information_review
const informationReviewSchema = new mongoose.Schema(
  {
    id_user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    star: {
      type: Number,
      required: true,
    },
    review_content: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // Thêm createdAt và updatedAt cho mỗi mục
  }
);

// Schema chính cho Review
const reviewSchema = new mongoose.Schema(
  {
    id_product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    information_review: [informationReviewSchema], // Sử dụng schema con ở đây
  },
  {
    timestamps: true, // Thêm timestamps cho toàn bộ tài liệu Review
  }
);

module.exports = mongoose.model("Review", reviewSchema)