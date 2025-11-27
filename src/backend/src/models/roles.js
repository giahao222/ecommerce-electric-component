const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
}, {
  timestamps: true 
});

const Role = mongoose.model('Role', roleSchema);

const roles = [
  { name: "Admin" },
  { name: "User" },
];
// Hàm thêm danh mục không trùng lặp
const addRoles = async () => {
  try {
    for (const role of roles) {
      await Role.updateOne(
        { name: role.name }, // Kiểm tra danh mục theo tên
        { $set: role }, // Cập nhật nếu tồn tại, thêm mới nếu không
        { upsert: true } // Thêm mới nếu không tìm thấy
      );
    }
    console.log("Danh mục Role đã được thêm hoặc cập nhật thành công.");
  } catch (error) {
    console.error("Lỗi khi thêm danh mục:", error);
  }
};

// Gọi hàm thêm danh mục
addRoles();

module.exports = Role;