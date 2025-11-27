const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    product_name: { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, trim: true },
    brand:       { type: String, required: true, trim: true },          // "ASUS", "Dell", "NVIDIA"
    category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },

    price_new:   { type: Number, required: true },
    price_old:   { type: Number },
    stock:       { type: Number, default: 0 },

    thumbnail:   { type: String },       // ảnh chính
    images:      [{ type: String }],     // gallery

    short_description: { type: String },
    description:       { type: String },

    // Thông số kỹ thuật
    specs: {
      cpu:          String,
      gpu:          String,
      ram:          String,
      storage:      String,
      screen:       String,              // "15.6\" FHD 144Hz"
      refresh_rate: String,
      battery:      String,
      psu:          String,
      form_factor:  String,              // "ATX", "mATX"
      other:        String
    },

    isFeatured: { type: Boolean, default: false },  // dùng cho mục "Top Picks", "Featured Builds"
    isNew:      { type: Boolean, default: false },

    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tag' }]
  },
  { timestamps: true }
);
const Product = mongoose.model("Product", productSchema);

module.exports = Product;