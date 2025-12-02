const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const Tag = mongoose.model("Tag", tagSchema);

// 🔥 Tags dành cho thiết bị điện tử
const tags = [
  { name: "Laptop Gaming" },
  { name: "Laptop Văn phòng" },
  { name: "Laptop Workstation" },

  { name: "PC Gaming" },
  { name: "PC Đồ họa" },
  { name: "PC Văn phòng" },

  { name: "Card Đồ Hoạ (GPU)" },
  { name: "CPU" },
  { name: "Mainboard" },
  { name: "RAM" },
  { name: "SSD" },
  { name: "HDD" },
  { name: "PSU" },
  { name: "Case" },
  { name: "Tản nhiệt" },

  { name: "Màn hình" },
  { name: "Bàn phím" },
  { name: "Chuột" },
  { name: "Tai nghe" },

  { name: "Hàng mới" },
  { name: "Giảm giá" },
  { name: "Hot" },
];

const addTags = async () => {
  try {
    for (const tag of tags) {
      await Tag.updateOne(
        { name: tag.name },
        { $set: tag },
        { upsert: true }
      );
    }
    console.log("✔ Tags thiết bị điện tử đã cập nhật.");
  } catch (error) {
    console.error("Lỗi cập nhật tags:", error);
  }
};

addTags();

module.exports = Tag;
