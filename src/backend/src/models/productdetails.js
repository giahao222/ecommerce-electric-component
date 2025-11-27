const mongoose = require("mongoose");

const productDetailSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },

    sku:          { type: String, required: true, unique: true },   // mã riêng cho biến thể
    variant_name: { type: String },                                 // "16GB RAM / 512GB SSD"
    price:        { type: Number, required: true },
    stock:        { type: Number, default: 0 },

    // Ghi đè 1 phần thông số so với product cha (nếu cần)
    specsOverride: {
      cpu:     String,
      gpu:     String,
      ram:     String,
      storage: String
    }
  },
  { timestamps: true }
);

const arrayUnique = (value) => Array.isArray(value) && new Set(value).size === value.length;

