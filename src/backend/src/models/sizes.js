const mongoose = require("mongoose");

const sizeSchema = new mongoose.Schema(
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

const Size = mongoose.model("Size", sizeSchema);
const sizes = [
  { name: "S" },
  { name: "M" },
  { name: "L" },
  { name: "XL" },
  { name: "XXL" },
];
// Hàm thêm danh mục không trùng lặp
const addSizes = async () => {
  try {
    for (const size of sizes) {
      await Size.updateOne(
        { name: size.name }, // Kiểm tra danh mục theo tên
        { $set: size }, // Cập nhật nếu tồn tại, thêm mới nếu không
        { upsert: true } // Thêm mới nếu không tìm thấy
      );
    }
    console.log("Danh mục Size đã được thêm hoặc cập nhật thành công.");
  } catch (error) {
    console.error("Lỗi khi thêm danh mục:", error);
  }
};

// Gọi hàm thêm danh mục
addSizes();

module.exports = Size;