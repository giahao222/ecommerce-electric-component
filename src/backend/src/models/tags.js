const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Tag = mongoose.model("Tag", tagSchema);
const tags = [
  { name: "Bán chạy" },
  { name: "Giảm giá" },
  { name: "Hàng mới" },
  { name: "Xu hướng" },
  { name: "Sản phẩm cao cấp" },
];
// Hàm thêm danh mục không trùng lặp
const addTags = async () => {
  try {
    for (const tag of tags) {
      await Tag.updateOne(
        { name: tag.name }, // Kiểm tra danh mục theo tên
        { $set: tag }, // Cập nhật nếu tồn tại, thêm mới nếu không
        { upsert: true } // Thêm mới nếu không tìm thấy
      );
    }
    console.log("Danh mục Tag đã được thêm hoặc cập nhật thành công.");
  } catch (error) {
    console.error("Lỗi khi thêm danh mục:", error);
  }
};

// Gọi hàm thêm danh mục
addTags();

module.exports = Tag;