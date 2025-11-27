const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
}, {
  timestamps: true 
});

const Color = mongoose.model('Color', colorSchema);
const colors = [
  { name: "Đỏ" },
  { name: "Xanh Dương" },
  { name: "Đen" },
  { name: "Trắng" },
  { name: "Vàng" },
  { name: "Hồng" },
];

// Hàm thêm danh mục không trùng lặp
const addColors = async () => {
  try {
    for (const color of colors) {
      await Color.updateOne(
        { name: color.name }, // Kiểm tra danh mục theo tên
        { $set: color }, // Cập nhật nếu tồn tại, thêm mới nếu không
        { upsert: true } // Thêm mới nếu không tìm thấy
      );
    }
    console.log("Danh mục Color đã được thêm hoặc cập nhật thành công.");
  } catch (error) {
    console.error("Lỗi khi thêm danh mục:", error);
  }
};

// Gọi hàm thêm danh mục
addColors();

module.exports = Color;
