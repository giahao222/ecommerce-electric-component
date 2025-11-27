const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
}, {
  timestamps: true 
});

const Category = mongoose.model("Category", categorySchema);

// Dữ liệu danh mục
const categories = [
  { name: "Laptops" },
  { name: "Desktops" },
  { name: "Components" },
];

// Hàm thêm danh mục không trùng lặp
const addCategories = async () => {
  try {
    for (const category of categories) {
      await Category.updateOne(
        { name: category.name }, // Kiểm tra danh mục theo tên
        { $set: category }, // Cập nhật nếu tồn tại, thêm mới nếu không
        { upsert: true } // Thêm mới nếu không tìm thấy
      );
    }
    console.log("Danh mục Category đã được thêm hoặc cập nhật thành công.");
  } catch (error) {
    console.error("Lỗi khi thêm danh mục:", error);
  }
};

// Gọi hàm thêm danh mục
addCategories();

module.exports = Category;
