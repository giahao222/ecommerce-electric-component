const mongoose = require("mongoose");

const productDetailSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },

    sku: { type: String, required: true, unique: true }, // mã sản phẩm cụ thể
    variant_name: { type: String }, // "16GB / 512GB", "RTX 4070", "Đen"

    price: { type: Number, required: true },
    price_old: { type: Number },
    stock: { type: Number, default: 0 },

    // Ghi đè specs từ product cha
    specsOverride: {
      cpu: String,
      gpu: String,
      ram: String,
      storage: String,
      color: String,
    },
  },
  { timestamps: true }
);

// check unique array (nếu cần validate custom)
const arrayUnique = (value) =>
  Array.isArray(value) && new Set(value).size === value.length;

module.exports = mongoose.model("ProductDetail", productDetailSchema);
