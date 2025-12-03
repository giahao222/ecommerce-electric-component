const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    product_name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },

    brand: { type: String, required: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    sub_category: { type: String }, // Laptop Gaming / PC Gaming / GPU / CPU

    price_new: { type: Number, required: true },
    price_old: { type: Number },
    stock: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["available", "out_of_stock", "preorder", "discontinued"],
      default: "available",
    },

    thumbnail: { type: String },
    images: [{ type: String }],

    short_description: { type: String },
    long_description: { type: String }, // HTML mô tả dài

    warranty: { type: String }, // "24 tháng"
    condition: { type: String }, // new / like new / 99%
    release_date: { type: Date },

    included_items: [String],
    promotions: [String],

    specs: {
      cpu: String,
      gpu: String,
      ram: String,
      storage: String,

      screen: String,         // "15.6 FHD IPS"
      refresh_rate: String,   // 144Hz

      battery: String,
      psu: String,
      form_factor: String,    // ATX / mATX

      weight: String,
      dimensions: String,     // 32x22x2 cm

      os: String,
      ports: String,          // HDMI, USB-C,...
      wireless: String,       // Wifi 6, BT 5.2
      color: String,

      other: String,
    },

    rating_average: { type: Number, default: 0 },
    rating_count: { type: Number, default: 0 },

    meta_title: String,
    meta_description: String,
    meta_keywords: [String],

    isFeatured: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },

    tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);