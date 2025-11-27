// seedProducts.js  (đặt cạnh server.js)
const mongoose = require('mongoose');
const path = require('path');

// load biến môi trường từ .env
require('dotenv').config({ path: path.join(__dirname, '.env') });

// chỉnh lại tên biến theo .env của bạn (thường là MONGO_URI / MONGODB_URI)
const uri =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  process.env.DB_URI;

if (!uri) {
  console.error('❌ Không tìm thấy biến kết nối Mongo trong .env (MONGO_URI / MONGODB_URI / DB_URI)');
  process.exit(1);
}

// Require model để register vào mongoose
require('./src/models/products');
const Category = require('./src/models/categories'); // file bạn vừa gửi

// Hàm tạo slug đơn giản
function toSlug(str) {
  return str
    .toString()
    .normalize('NFD')                  // bỏ dấu tiếng Việt
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')      // thay khoảng trắng & ký tự đặc biệt bằng -
    .replace(/^-+|-+$/g, '');         // bỏ - ở đầu / cuối
}

async function main() {
  try {
    await mongoose.connect(uri);
    console.log('✅ Đã connect MongoDB');

    const Product = mongoose.model('Product');   // tên trong products.js: mongoose.model("Product", ...)

    // 👉 Lấy category mặc định: "Laptops"
    let defaultCategory = await Category.findOne({ name: 'Laptops' });

    // Nếu chưa có (trong trường hợp bạn chưa để script addCategories chạy), thì tạo mới:
    if (!defaultCategory) {
      defaultCategory = await Category.create({ name: 'Laptops' });
      console.log('✅ Đã tạo Category "Laptops":', defaultCategory._id);
    } else {
      console.log('ℹ️ Dùng lại Category "Laptops":', defaultCategory._id);
    }

    // Nếu muốn reset toàn bộ products trước khi seed, mở comment dòng dưới:
    // await Product.deleteMany({});

    const rawProducts = [
      {
        product_name: 'ASUS ROG Zephyrus G14',
        price_new: 1699,
        price_old: 1899,
        brand: 'ASUS',
        thumbnail: 'https://via.placeholder.com/600x600?text=ASUS+G14'
      },
      {
        product_name: 'NVIDIA GeForce RTX 4070 Ti',
        price_new: 799,
        brand: 'NVIDIA',
        thumbnail: 'https://via.placeholder.com/600x600?text=RTX+4070+Ti'
      },
      {
        product_name: 'Samsung 970 EVO Plus 1TB',
        price_new: 129,
        brand: 'Samsung',
        thumbnail: 'https://via.placeholder.com/600x600?text=970+EVO+Plus'
      }
    ];

    // Thêm category + slug vào từng product
    const sampleProducts = rawProducts.map(p => ({
      ...p,
      slug: toSlug(p.product_name),
      category: defaultCategory._id
    }));

    const inserted = await Product.insertMany(sampleProducts);
    console.log(`✅ Đã thêm ${inserted.length} sản phẩm`);
    inserted.forEach(p => console.log(`   - ${p.product_name} (${p._id}) slug=${p.slug}`));

    await mongoose.disconnect();
    console.log('✅ Đã ngắt kết nối MongoDB');
  } catch (err) {
    console.error('❌ Lỗi seed product:', err);
    process.exit(1);
  }
}

main();
