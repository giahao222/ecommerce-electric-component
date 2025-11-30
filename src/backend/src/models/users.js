// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     full_name: {
//       type: String,
//       required: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     password: {
//       type: String,
//       required: true,
//     },
//     id_roles: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Role",
//       required: true,
//     },
//     image: {
//       type: String,
//     },
//     active: {
//       type: Boolean,
//     },
//     verify_email: { type: Boolean, default: false },
//   },
//   {
//     timestamps: true,
//   }
// );

// module.exports = mongoose.model("User", userSchema);


const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function() {
        // Password chỉ bắt buộc nếu không đăng nhập bằng social
        return !this.facebookId && !this.googleId;
      }
    },
    id_roles: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    image: {
      type: String,
      default: ""
    },
    active: {
      type: Boolean,
      default: false
    },
    verify_email: { 
      type: Boolean, 
      default: false 
    },
    
    // ✅ THÊM CÁC FIELD MỚI CHO SOCIAL LOGIN
    facebookId: {
      type: String,
      unique: true,
      sparse: true  // Cho phép null, chỉ check unique khi có giá trị
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true
    },
    lastAccessTime: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true, // Tự động thêm createdAt, updatedAt
  }
);

// ✅ Index để tìm kiếm nhanh hơn
userSchema.index({ email: 1 });
userSchema.index({ facebookId: 1 });
userSchema.index({ googleId: 1 });

module.exports = mongoose.model("User", userSchema);
