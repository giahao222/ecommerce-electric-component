/**********************************************************
 * SEED DATA FULL — 30 PRODUCTS (Laptop / PC / GPU)
 * RUN: node seed.js
 **********************************************************/
const mongoose = require("mongoose");

// 👉 CONNECT DATABASE
const MONGO_URI = "mongodb+srv://only1huyle_db_user:aJDQIYOLFSHcvukh@cluster0.37hj4sx.mongodb.net/"; 
mongoose.connect(MONGO_URI).then(() => {
  console.log("MongoDB connected");
});

// 👉 IMPORT MODELS (TÊN FILE ĐÃ FIX ĐÚNG)
const Category = require("./models/categories");
const Tag = require("./models/tags");
const Product = require("./models/products");
const ProductDetail = require("./models/productdetails");

// 👉 CLEAR ALL OLD DATA
async function clearAll() {
  await Category.deleteMany({});
  await Tag.deleteMany({});
  await Product.deleteMany({});
  await ProductDetail.deleteMany({});
  console.log("✔ Database cleared");
}

/**********************************************************
 * PART 1 — CATEGORY (THEO FILE categories.js THỰC TẾ)
 **********************************************************/
async function seedCategories() {
  const categories = [
    { name: "Laptops" },
    { name: "Desktops" },
    { name: "Components" },
  ];

  for (const c of categories) {
    await Category.updateOne({ name: c.name }, { $set: c }, { upsert: true });
  }

  const docs = await Category.find({});
  console.log("✔ Category seeded");
  return docs;
}

/**********************************************************
 * PART 2 — TAGS (Upsert, không duplicate)
 **********************************************************/
const tagList = [
  "Laptop Gaming",
  "Laptop Văn phòng",
  "Laptop Workstation",
  "PC Gaming",
  "PC Đồ họa",
  "PC Văn phòng",
  "Card Đồ Hoạ (GPU)",
  "CPU",
  "Mainboard",
  "RAM",
  "SSD",
  "Màn hình",
  "Phụ kiện",
  "Giảm giá",
  "Hàng mới",
  "Hot"
];

async function seedTags() {
  for (const tagName of tagList) {
    await Tag.updateOne(
      { name: tagName },
      { $set: { name: tagName } },
      { upsert: true }
    );
  }

  const docs = await Tag.find({});
  console.log("✔ Tags upserted (no duplicates)");
  return docs;
}

/**********************************************************
 * PART 3 — PRODUCTS (đã fix category đúng theo DB)
 **********************************************************/

// Ảnh mẫu
const img = {
  laptop1: "http://localhost:8080/images/Laptop/1.png",
  laptop2: "http://localhost:8080/images/Laptop/2.png",
  laptop3: "http://localhost:8080/images/Laptop/3.png",
  laptop4: "http://localhost:8080/images/Laptop/4.png",
  laptop5: "http://localhost:8080/images/Laptop/5.png",
  laptop6: "http://localhost:8080/images/Laptop/6.png",
  laptop7: "http://localhost:8080/images/Laptop/7.png",
  laptop8: "http://localhost:8080/images/Laptop/8.png",
  laptop9: "http://localhost:8080/images/Laptop/9.png",
  laptop10: "http://localhost:8080/images/Laptop/10.png",
  gpu_4070: "http://localhost:8080/images/Component/1.png",
  gpu_4060: "http://localhost:8080/images/Component/2.png",
  gpu_4080: "http://localhost:8080/images/Component/3.png",
  rtx_4060: "http://localhost:8080/images/Component/4.png",
  gpu_4070Ti: "http://localhost:8080/images/Component/5.png",
  pc1: "http://localhost:8080/images/Desktop/1.png",
  pc2: "http://localhost:8080/images/Desktop/2.png",
  pc3: "http://localhost:8080/images/Desktop/3.png",
  pc4: "http://localhost:8080/images/Desktop/4.png",
  pc5: "http://localhost:8080/images/Desktop/5.png",
  pc6: "http://localhost:8080/images/Desktop/6.png",
  pc7: "http://localhost:8080/images/Desktop/7.png",
  pc8: "http://localhost:8080/images/Desktop/8.png",
  pc9: "http://localhost:8080/images/Desktop/9.png",
  pc10: "http://localhost:8080/images/Desktop/10.png",
};

const shortHTML = "Sản phẩm hiệu năng cao cho game thủ và dân đồ họa.";
const longHTML = `
  <h3>Giới thiệu sản phẩm</h3>
  <p>Hiệu năng mạnh mẽ, thiết kế hiện đại.</p>
  <ul>
    <li>CPU mạnh cho multitask</li>
    <li>GPU chiến mọi tựa game</li>
    <li>Màn hình tần số quét cao</li>
  </ul>
`;

const productData = [
  /**************************************************************
   * 10 LAPTOP GAMING
   **************************************************************/
  {
    product_name: "ASUS TUF Gaming F15",
    slug: "asus-tuf-gaming-f15",
    brand: "ASUS",
    category: "Laptops",
    sub_category: "Laptop Gaming",
    thumbnail: img.laptop5,
    images: [img.laptop5],
    price_new: 25990000,
    price_old: 28990000,
    short_description: shortHTML,
    long_description: longHTML,
    warranty: "24 tháng",
    promotions: ["Tặng balo", "Giảm thêm 500.000đ"],
    specs: {
      cpu: "Intel Core i7-12700H",
      gpu: "NVIDIA RTX 3060 6GB",
      ram: "16GB DDR4",
      storage: "512GB SSD NVMe",
      screen: "15.6 FHD IPS",
      refresh_rate: "144Hz",
      battery: "56Wh",
      weight: "2.3kg",
      os: "Windows 11",
      wireless: "Wifi 6, Bluetooth 5.2",
      ports: "USB-C, HDMI",
      color: "Đen"
    },
    tags: ["Laptop Gaming", "Hot", "Hàng mới"],
    variants: [
      { sku: "TUF-F15-16-512", variant_name: "16GB RAM / 512GB SSD", price: 25990000 },
      { sku: "TUF-F15-32-1TB", variant_name: "32GB RAM / 1TB SSD", price: 28990000 }
    ]
  },

  {
    product_name: "MSI GF63 Thin",
    slug: "msi-gf63-thin",
    brand: "MSI",
    category: "Laptops",
    sub_category: "Laptop Gaming",
    thumbnail: img.laptop9,
    images: [img.laptop9],
    price_new: 19990000,
    price_old: 22990000,
    short_description: shortHTML,
    long_description: longHTML,
    warranty: "12 tháng",
    specs: {
      cpu: "Intel i5-11400H",
      gpu: "GTX 1650 4GB",
      ram: "8GB DDR4",
      storage: "512GB SSD",
      screen: "15.6 FHD",
      refresh_rate: "60Hz"
    },
    tags: ["Laptop Gaming"],
    variants: [
      { sku: "GF63-8-512", variant_name: "8GB/512GB", price: 19990000 },
      { sku: "GF63-16-512", variant_name: "16GB/512GB", price: 21990000 }
    ]
  },

  /**************************************************************
   * 5 LAPTOP VĂN PHÒNG
   **************************************************************/
  {
    product_name: "Acer Aspire 7",
    slug: "acer-aspire-7",
    brand: "Acer",
    category: "Laptops",
    sub_category: "Laptop Văn phòng",
    thumbnail: img.laptop1,
    images: [img.laptop1],
    price_new: 16990000,
    short_description: shortHTML,
    long_description: longHTML,
    warranty: "24 tháng",
    specs: {
      cpu: "Intel Core i5-12450H",
      gpu: "GTX 1650",
      ram: "8GB DDR4",
      storage: "512GB SSD",
      screen: "15.6 FHD"
    },
    tags: ["Laptop Văn phòng"],
    variants: [
      { sku: "A7-8-512", variant_name: "8GB/512GB", price: 16990000 },
      { sku: "A7-16-512", variant_name: "16GB/512GB", price: 18990000 }
    ]
  },

  /**************************************************************
   * 5 PC GAMING
   **************************************************************/
  {
    product_name: "PC Gaming RTX 4070 Super",
    slug: "pc-gaming-4070-super",
    brand: "GearVN",
    category: "Desktops",
    sub_category: "PC Gaming",
    thumbnail: img.pc1,
    images: [img.pc1],
    price_new: 39990000,
    price_old: 42990000,
    short_description: "PC Gaming cấu hình mạnh cho game AAA.",
    long_description: longHTML,
    warranty: "36 tháng",
    specs: {
      cpu: "i7-13700F",
      gpu: "RTX 4070 Super 12GB",
      ram: "16GB DDR4",
      storage: "1TB SSD",
      psu: "650W"
    },
    tags: ["PC Gaming"],
    variants: [
      { sku: "PC-4070S-16", variant_name: "16GB RAM / 1TB SSD", price: 39990000 },
      { sku: "PC-4070S-32", variant_name: "32GB RAM / 1TB SSD", price: 42990000 }
    ]
  },

  /**************************************************************
   * 5 PC ĐỒ HỌA
   **************************************************************/
  {
    product_name: "PC Đồ họa RTX 4060",
    slug: "pc-do-hoa-4060",
    brand: "MegaTech",
    category: "Desktops",
    sub_category: "PC Đồ họa",
    thumbnail: img.pc2,
    images: [img.pc2],
    price_new: 29990000,
    short_description: "PC tối ưu cho dựng phim và render.",
    long_description: longHTML,
    warranty: "24 tháng",
    specs: {
      cpu: "Ryzen 5 5600",
      gpu: "RTX 4060 8GB",
      ram: "16GB DDR4",
      storage: "1TB SSD"
    },
    tags: ["PC Đồ họa"],
    variants: [
      { sku: "PC-4060-16", variant_name: "16GB RAM / 1TB SSD", price: 29990000 },
      { sku: "PC-4060-32", variant_name: "32GB RAM / 1TB SSD", price: 32990000 }
    ]
  },

  /**************************************************************
   * 5 GPU
   **************************************************************/
  {
    product_name: "MSI RTX 4070 Gaming X Slim",
    slug: "msi-rtx-4070-gaming-x-slim",
    brand: "MSI",
    category: "Components",
    sub_category: "Card Đồ Hoạ (GPU)",
    thumbnail: img.gpu_4070,
    images: [img.gpu_4070],
    price_new: 15990000,
    price_old: 17990000,
    short_description: "GPU mạnh mẽ cho gaming.",
    long_description: longHTML,
    warranty: "36 tháng",
    specs: {
      gpu: "RTX 4070 12GB"
    },
    tags: ["Card Đồ Hoạ (GPU)"],
    variants: [
      { sku: "RTX4070-MSI", variant_name: "12GB", price: 15990000 }
    ]
  },

  {
    product_name: "MSI RTX 4060 Ventus 2X",
    slug: "msi-rtx-4060-ventus-2x",
    brand: "MSI",
    category: "Components",
    sub_category: "Card Đồ Hoạ (GPU)",
    thumbnail: img.gpu_4060,
    images: [img.gpu_4060],
    price_new: 9190000,
    short_description: "Card đồ hoạ cho game 1080p.",
    long_description: longHTML,
    warranty: "36 tháng",
    specs: {
      gpu: "RTX 4060 8GB"
    },
    tags: ["Card Đồ Hoạ (GPU)", "Giảm giá"],
    variants: [
      { sku: "RTX4060-MSI", variant_name: "8GB", price: 9190000 }
    ]
  }

  
];

/**************************************************************
 * 7 LAPTOP GAMING BỔ SUNG
 **************************************************************/
productData.push(
  {
    product_name: "Lenovo Legion 5 Pro",
    slug: "lenovo-legion-5-pro",
    brand: "Lenovo",
    category: "Laptops",
    sub_category: "Laptop Gaming",
    thumbnail: img.laptop1,
    images: [img.laptop1],
    price_new: 32990000,
    short_description: shortHTML,
    long_description: longHTML,
    specs: {
      cpu: "Ryzen 7 5800H",
      gpu: "RTX 3070 8GB",
      ram: "16GB DDR4",
      storage: "1TB SSD",
      screen: "16-inch QHD 165Hz"
    },
    tags: ["Laptop Gaming", "Hot"],
    variants: [
      { sku: "LEG5PRO-16-1TB", variant_name: "16GB/1TB", price: 32990000 }
    ]
  },

  {
    product_name: "ASUS ROG Strix G16",
    slug: "asus-rog-strix-g16",
    brand: "ASUS",
    category: "Laptops",
    sub_category: "Laptop Gaming",
    thumbnail: img.laptop2,
    images: [img.laptop2],
    price_new: 38990000,
    specs: {
      cpu: "i7-13650HX",
      gpu: "RTX 4060 8GB",
      ram: "16GB DDR5",
      storage: "512GB SSD",
      screen: "16-inch FHD 165Hz"
    },
    tags: ["Laptop Gaming"],
    variants: [
      { sku: "G16-16-512", variant_name: "16GB/512GB", price: 38990000 }
    ]
  },

  {
    product_name: "HP Omen 16",
    slug: "hp-omen-16",
    brand: "HP",
    category: "Laptops",
    sub_category: "Laptop Gaming",
    thumbnail: img.laptop3,
    images: [img.laptop3],
    price_new: 31990000,
    specs: {
      cpu: "i7-12700H",
      gpu: "RTX 3060 6GB",
      ram: "16GB DDR5",
      storage: "512GB SSD",
      screen: "16-inch IPS 144Hz"
    },
    tags: ["Laptop Gaming"],
    variants: [
      { sku: "OM16-16-512", variant_name: "16GB/512GB", price: 31990000 }
    ]
  },

  {
    product_name: "Dell G15 Gaming",
    slug: "dell-g15-gaming",
    brand: "Dell",
    category: "Laptops",
    sub_category: "Laptop Gaming",
    thumbnail: img.laptop4,
    images: [img.laptop4],
    price_new: 27990000,
    specs: {
      cpu: "Ryzen 7 6800H",
      gpu: "RTX 3050Ti",
      ram: "16GB DDR5",
      storage: "512GB SSD",
      screen: "15.6 FHD 120Hz"
    },
    tags: ["Laptop Gaming"],
    variants: [
      { sku: "G15-16-512", variant_name: "16GB/512GB", price: 27990000 }
    ]
  },

  {
    product_name: "Gigabyte G5 KF",
    slug: "gigabyte-g5-kf",
    brand: "Gigabyte",
    category: "Laptops",
    sub_category: "Laptop Gaming",
    thumbnail: img.laptop6,
    images: [img.laptop6],
    price_new: 24990000,
    specs: {
      cpu: "i5-12500H",
      gpu: "RTX 4060",
      ram: "16GB DDR4",
      storage: "512GB SSD",
      screen: "15.6 FHD 144Hz"
    },
    tags: ["Laptop Gaming"],
    variants: [
      { sku: "G5KF-16-512", variant_name: "16GB/512GB", price: 24990000 }
    ]
  },

  {
    product_name: "ACER Nitro 5 Tiger",
    slug: "acer-nitro-5-tiger",
    brand: "Acer",
    category: "Laptops",
    sub_category: "Laptop Gaming",
    thumbnail: img.laptop7,
    images: [img.laptop7],
    price_new: 23990000,
    specs: {
      cpu: "i5-12500H",
      gpu: "RTX 3050",
      ram: "8GB DDR4",
      storage: "512GB SSD",
      screen: "15.6 FHD 144Hz"
    },
    tags: ["Laptop Gaming"],
    variants: [
      { sku: "AN5-8-512", variant_name: "8GB/512GB", price: 23990000 }
    ]
  },

  {
    product_name: "MSI Bravo 15",
    slug: "msi-bravo-15",
    brand: "MSI",
    category: "Laptops",
    sub_category: "Laptop Gaming",
    thumbnail: img.laptop8,
    images: [img.laptop8],
    price_new: 18990000,
    specs: {
      cpu: "Ryzen 5 5500H",
      gpu: "RX 6500M",
      ram: "8GB",
      storage: "512GB SSD",
      screen: "15.6 FHD 144Hz"
    },
    tags: ["Laptop Gaming"],
    variants: [
      { sku: "BR15-8-512", variant_name: "8GB/512GB", price: 18990000 }
    ]
  }
);

/**************************************************************
 * 4 LAPTOP VĂN PHÒNG BỔ SUNG
 **************************************************************/
productData.push(
  {
    product_name: "HP Pavilion 15",
    slug: "hp-pavilion-15",
    brand: "HP",
    category: "Laptops",
    sub_category: "Laptop Văn phòng",
    thumbnail: img.laptop1,
    images: [img.laptop1],
    price_new: 15990000,
    specs: {
      cpu: "i5-1235U",
      gpu: "Intel Iris Xe",
      ram: "8GB",
      storage: "512GB SSD"
    },
    tags: ["Laptop Văn phòng"],
    variants: [
      { sku: "PAV15-8-512", variant_name: "8GB/512GB", price: 15990000 }
    ]
  },

  {
    product_name: "Dell Inspiron 14",
    slug: "dell-inspiron-14",
    brand: "Dell",
    category: "Laptops",
    sub_category: "Laptop Văn phòng",
    thumbnail: img.laptop2,
    images: [img.laptop2],
    price_new: 13990000,
    specs: {
      cpu: "i3-1215U",
      ram: "8GB",
      storage: "256GB SSD"
    },
    tags: ["Laptop Văn phòng"],
    variants: [
      { sku: "INS14-8-256", variant_name: "8GB/256GB", price: 13990000 }
    ]
  },

  {
    product_name: "ASUS Vivobook 15",
    slug: "asus-vivobook-15",
    brand: "ASUS",
    category: "Laptops",
    sub_category: "Laptop Văn phòng",
    thumbnail: img.laptop1,
    images: [img.laptop1],
    price_new: 12990000,
    specs: {
      cpu: "i3-1315U",
      ram: "8GB",
      storage: "512GB SSD"
    },
    tags: ["Laptop Văn phòng"],
    variants: [
      { sku: "VB15-8-512", variant_name: "8GB/512GB", price: 12990000 }
    ]
  },

  {
    product_name: "Lenovo Ideapad Slim 3",
    slug: "lenovo-ideapad-slim-3",
    brand: "Lenovo",
    category: "Laptops",
    sub_category: "Laptop Văn phòng",
    thumbnail: img.laptop2,
    images: [img.laptop2],
    price_new: 11990000,
    specs: {
      cpu: "Ryzen 5 5500U",
      ram: "8GB",
      storage: "512GB SSD"
    },
    tags: ["Laptop Văn phòng"],
    variants: [
      { sku: "IP3-8-512", variant_name: "8GB/512GB", price: 11990000 }
    ]
  }
);

/**************************************************************
 * 4 PC GAMING BỔ SUNG
 **************************************************************/
productData.push(
  {
    product_name: "PC Gaming RTX 4060",
    slug: "pc-gaming-4060",
    brand: "MegaTech",
    category: "Desktops",
    sub_category: "PC Gaming",
    thumbnail: img.pc4,
    images: [img.pc4],
    price_new: 25990000,
    specs: {
      cpu: "i5-12400F",
      gpu: "RTX 4060",
      ram: "16GB",
      storage: "500GB SSD"
    },
    tags: ["PC Gaming"],
    variants: [
      { sku: "PC4060-16-500", variant_name: "16GB/500GB", price: 25990000 }
    ]
  },

  {
    product_name: "PC Gaming GTX 1660 Super",
    slug: "pc-gaming-1660s",
    brand: "GearVN",
    category: "Desktops",
    sub_category: "PC Gaming",
    thumbnail: img.pc3,
    images: [img.pc3],
    price_new: 15990000,
    specs: {
      cpu: "i3-12100F",
      gpu: "GTX 1660 Super",
      ram: "16GB",
      storage: "500GB SSD"
    },
    tags: ["PC Gaming"],
    variants: [
      { sku: "PC1660S-16-500", variant_name: "16GB/500GB", price: 15990000 }
    ]
  },

  {
    product_name: "PC Streaming 2024",
    slug: "pc-streaming-2024",
    brand: "StreamPro",
    category: "Desktops",
    sub_category: "PC Gaming",
    thumbnail: img.pc5,
    images: [img.pc5],
    price_new: 18990000,
    specs: {
      cpu: "Ryzen 5 5600G",
      gpu: "Radeon iGPU",
      ram: "16GB",
      storage: "1TB SSD"
    },
    tags: ["PC Gaming"],
    variants: [
      { sku: "PCSTRM-16-1TB", variant_name: "16GB/1TB", price: 18990000 }
    ]
  },

  {
    product_name: "PC Gaming RTX 3050",
    slug: "pc-gaming-3050",
    brand: "ASUS",
    category: "Desktops",
    sub_category: "PC Gaming",
    thumbnail: img.pc6,
    images: [img.pc6],
    price_new: 21990000,
    specs: {
      cpu: "i5-11400F",
      gpu: "RTX 3050",
      ram: "16GB",
      storage: "1TB SSD"
    },
    tags: ["PC Gaming"],
    variants: [
      { sku: "PC3050-16-1TB", variant_name: "16GB/1TB", price: 21990000 }
    ]
  }
);

/**************************************************************
 * 4 PC ĐỒ HỌA BỔ SUNG
 **************************************************************/
productData.push(
  {
    product_name: "PC Đồ họa 4K Edit",
    slug: "pc-do-hoa-4k-edit",
    brand: "EditPro",
    category: "Desktops",
    sub_category: "PC Đồ họa",
    thumbnail: img.pc7,
    images: [img.pc7],
    price_new: 32990000,
    specs: {
      cpu: "Ryzen 7 5800X",
      gpu: "RTX 3060 Ti",
      ram: "32GB",
      storage: "1TB NVMe SSD"
    },
    tags: ["PC Đồ họa"],
    variants: [
      { sku: "PC4K-32-1TB", variant_name: "32GB/1TB", price: 32990000 }
    ]
  },

  {
    product_name: "PC Render 2024",
    slug: "pc-render-2024",
    brand: "RenderBox",
    category: "Desktops",
    sub_category: "PC Đồ họa",
    thumbnail: img.pc8,
    images: [img.pc8],
    price_new: 35990000,
    specs: {
      cpu: "i7-12700F",
      gpu: "RTX 3070",
      ram: "32GB",
      storage: "1TB SSD"
    },
    tags: ["PC Đồ họa"],
    variants: [
      { sku: "PCR-32-1TB", variant_name: "32GB/1TB", price: 35990000 }
    ]
  },

  {
    product_name: "PC Studio Workstation",
    slug: "pc-studio-workstation",
    brand: "StudioPro",
    category: "Desktops",
    sub_category: "PC Đồ họa",
    thumbnail: img.pc9,
    images: [img.pc9],
    price_new: 38990000,
    specs: {
      cpu: "Ryzen 9 5900X",
      gpu: "RTX 3080",
      ram: "32GB",
      storage: "2TB NVMe SSD"
    },
    tags: ["PC Đồ họa"],
    variants: [
      { sku: "PCWS-32-2TB", variant_name: "32GB/2TB", price: 38990000 }
    ]
  },

  {
    product_name: "PC AI Developer",
    slug: "pc-ai-developer",
    brand: "AIDev",
    category: "Desktops",
    sub_category: "PC Đồ họa",
    thumbnail: img.pc10,
    images: [img.pc10],
    price_new: 45990000,
    specs: {
      cpu: "i9-12900K",
      gpu: "RTX 3090",
      ram: "64GB",
      storage: "2TB NVMe SSD"
    },
    tags: ["PC Đồ họa", "Hot"],
    variants: [
      { sku: "AIDEV-64-2TB", variant_name: "64GB/2TB", price: 45990000 }
    ]
  }
);

/**************************************************************
 * 3 GPU BỔ SUNG
 **************************************************************/
productData.push(
  {
    product_name: "ASUS RTX 4080 Super",
    slug: "asus-rtx-4080-super",
    brand: "ASUS",
    category: "Components",
    sub_category: "Card Đồ Hoạ (GPU)",
    thumbnail: img.gpu_4080,
    images: [img.gpu_4080],
    price_new: 32990000,
    specs: { gpu: "RTX 4080 Super 16GB" },
    tags: ["Card Đồ Hoạ (GPU)", "Hot"],
    variants: [
      { sku: "RTX4080-ASUS", variant_name: "16GB", price: 32990000 }
    ]
  },

  {
    product_name: "Gigabyte RTX 4070 Ti",
    slug: "gigabyte-rtx-4070-ti",
    brand: "Gigabyte",
    category: "Components",
    sub_category: "Card Đồ Hoạ (GPU)",
    thumbnail: img.gpu_4070Ti,
    images: [img.gpu_4070Ti],
    price_new: 23990000,
    specs: { gpu: "RTX 4070 Ti 12GB" },
    tags: ["Card Đồ Hoạ (GPU)"],
    variants: [
      { sku: "RTX4070TI-GB", variant_name: "12GB", price: 23990000 }
    ]
  },

  {
    product_name: "Zotac RTX 4060 Twin Edge",
    slug: "zotac-rtx-4060",
    brand: "Zotac",
    category: "Components",
    sub_category: "Card Đồ Hoạ (GPU)",
    thumbnail: img.rtx_4060,
    images: [img.rtx_4060],
    price_new: 8490000,
    specs: { gpu: "RTX 4060 8GB" },
    tags: ["Card Đồ Hoạ (GPU)"],
    variants: [
      { sku: "RTX4060-ZOT", variant_name: "8GB", price: 8490000 }
    ]
  }
);


// ======= INSERT PRODUCTS =======
async function seedProducts(categories, tags) {
  const catMap = {};
  categories.forEach((c) => {
    catMap[c.name.toLowerCase()] = c._id;
  });

  const tagMap = {};
  tags.forEach((t) => {
    tagMap[t.name] = t._id;
  });

  for (const p of productData) {
    const prod = await Product.create({
      product_name: p.product_name,
      slug: p.slug,
      brand: p.brand,
      category: catMap[p.category.toLowerCase()],
      sub_category: p.sub_category,
      thumbnail: p.thumbnail,
      images: p.images,
      price_new: p.price_new,
      price_old: p.price_old,
      short_description: p.short_description,
      long_description: p.long_description,
      warranty: p.warranty,
      promotions: p.promotions,
      specs: p.specs,
      tags: p.tags.map((name) => tagMap[name])
    });

    for (const v of p.variants) {
      await ProductDetail.create({
        product: prod._id,
        sku: v.sku,
        variant_name: v.variant_name,
        price: v.price,
      });
    }
  }

  console.log("✔ 30 Products + Variants seeded");
}

/**********************************************************
 * RUN ALL
 **********************************************************/
async function runSeed() {
  console.log("🧹 Clearing database...");
  await clearAll();

  console.log("📂 Seeding categories...");
  const categories = await seedCategories();

  console.log("🏷️  Seeding tags...");
  const tags = await seedTags();

  console.log("🛒 Seeding products & variants...");
  await seedProducts(categories, tags);

  console.log("🎉 DONE! SEED FINISHED.");
  mongoose.connection.close();
}

runSeed();
