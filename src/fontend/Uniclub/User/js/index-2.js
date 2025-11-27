// =========================
// 1. Chạy khi DOM ready
// =========================
document.addEventListener("DOMContentLoaded", () => {
  loadProducts();        // Grid sản phẩm chính (#product-container)
  loadProductList();     // Khối <ul id="product-list"> (nếu có)
  loadFeaturedSlider();  // Slider (#featured-slider-wrapper)
  saveTokenFromUrl();    // Lưu ?token=... vào localStorage (nếu có)
});

// =========================
// 2. Helper chung
// =========================

// Lấy token trên URL và lưu vào localStorage
function saveTokenFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get("token");

  if (token) {
    localStorage.setItem("token", token);
    console.log("Token saved to localStorage:", token);
  } else {
    console.log("No token found in URL");
  }
}

// Chuẩn hóa cấu trúc trả về của API /hproducts
function getProductsFromResponse(data) {
  console.log("🔍 /hproducts raw response:", data);

  if (!data) return [];

  // 1) Dạng mảng trực tiếp: [ {..}, {..} ]
  if (Array.isArray(data)) return data;

  // 2) Dạng { products: [ ... ] }
  if (Array.isArray(data.products)) return data.products;

  // 3) Dạng { data: [ ... ] }
  if (Array.isArray(data.data)) return data.data;

  // 4) Dạng { data: { products: [ ... ] } }
  if (data.data && Array.isArray(data.data.products)) return data.data.products;

  // 5) Dạng { products: { docs: [ ... ] } } hoặc tương tự
  if (data.products && Array.isArray(data.products.docs))
    return data.products.docs;

  // 6) Heuristic: tìm mảng đầu tiên trong object
  for (const key of Object.keys(data)) {
    if (Array.isArray(data[key])) {
      console.log("📦 Using array at key:", key);
      return data[key];
    }
  }

  console.warn("⚠️ Không tìm được mảng products trong response.");
  return [];
}

// Lấy URL ảnh (ưu tiên thumbnail, sau đó tới image, cuối cùng là placeholder)
function getProductImageUrl(product) {
  return (
    product.thumbnail ||
    product.image ||
    "https://via.placeholder.com/600x600?text=Product"
  );
}

// =========================
// 3. Grid sản phẩm chính (#product-container)
// =========================

async function loadProducts() {
  const productContainer = document.getElementById("product-container");
  if (!productContainer) {
    console.warn("⚠️ Không tìm thấy #product-container");
    return;
  }

  try {
    const response = await fetch("http://localhost:8080/hproducts");
    const data = await response.json();
    const products = getProductsFromResponse(data);

    console.log("📦 Products for grid:", products);

    if (!products || products.length === 0) {
      console.log("No products found (grid)");
      productContainer.innerHTML = "<p>No products found.</p>";
      return;
    }

    products.forEach((product) => {
      const productElement = document.createElement("div");
      productElement.classList.add("col-md-6", "col-lg-3", "my-4");

      const imgUrl = getProductImageUrl(product);

      productElement.innerHTML = `
        <div class="product-item">
          <div class="image-holder" style="width: 100%; height: 100%;">
            <img src="${imgUrl}" alt="${product.product_name}" class="product-image img-fluid">
          </div>
          <div class="cart-concern">
            <div class="cart-button d-flex justify-content-between align-items-center">
              <a href="#" class="btn-wrap cart-link d-flex align-items-center text-capitalize fs-6">
                add to cart <i class="icon icon-arrow-io pe-1"></i>
              </a>
              <a href="single-product.html?id=${product._id}" class="view-btn">
                <i class="icon icon-screen-full"></i>
              </a>
              <a href="#" class="wishlist-btn">
                <i class="icon icon-heart"></i>
              </a>
            </div>
          </div>
          <div class="product-detail d-flex justify-content-between align-items-center mt-4">
            <h4 class="product-title mb-0">
              <a href="single-product.html?id=${product._id}">${product.product_name}</a>
            </h4>
            <p class="m-0 fs-5 fw-normal">$${product.price_new}</p>
          </div>
        </div>
      `;

      productContainer.appendChild(productElement);
    });
  } catch (error) {
    console.error("❌ Error fetching products (grid):", error);
  }
}

// =========================
// 4. Danh sách sản phẩm dạng <ul id="product-list">
// =========================

async function loadProductList() {
  const list = document.getElementById("product-list");
  if (!list) {
    // Nếu trang hiện tại không có block này thì bỏ qua
    return;
  }

  try {
    const res = await fetch("http://localhost:8080/hproducts");
    const data = await res.json();
    const products = getProductsFromResponse(data);

    console.log("📦 Products for list:", products);

    if (!products || products.length === 0) {
      list.innerHTML = "<p>No products found.</p>";
      return;
    }

    products.forEach((product) => {
      const li = document.createElement("li");
      li.classList.add(
        "product",
        "type-product",
        "status-publish",
        "instock",
        "purchasable",
        "product-type-simple"
      );

      const imgUrl = getProductImageUrl(product);

      li.innerHTML = `
        <a href="../single-product.html?id=${product._id}"
           class="woocommerce-LoopProduct-link woocommerce-loop-product__link">
          <div class="twbb-image-wrap">
            <div class="twbb-image-container" style="aspect-ratio: 1/1;">
              <img src="${imgUrl}"
                   class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail"
                   alt="${product.product_name}">
            </div>
          </div>
          <h2 class="woocommerce-loop-product__title">${product.product_name}</h2>
          <span class="price">
            <span class="woocommerce-Price-amount amount">
              <bdi>
                <span class="woocommerce-Price-currencySymbol">&#36;</span>${product.price_new}
              </bdi>
            </span>
          </span>
        </a>

        <div class="twbb-add-to-cart-container">
          <a href="#" class="button product_type_simple add_to_cart_button">
            Add to cart
          </a>
        </div>
      `;

      list.appendChild(li);
    });
  } catch (err) {
    console.error("❌ Error loading products (list):", err);
  }
}

// =========================
// 5. Slider sản phẩm (#featured-slider-wrapper)
// =========================

async function loadFeaturedSlider() {
  const sliderWrapper = document.getElementById("featured-slider-wrapper");
  if (!sliderWrapper) {
    console.warn("⚠️ Không tìm thấy #featured-slider-wrapper");
    return;
  }

  try {
    const res = await fetch("http://localhost:8080/hproducts");
    const data = await res.json();
    const products = getProductsFromResponse(data);

    console.log("📦 Products for slider:", products);

    if (!products || products.length === 0) {
      sliderWrapper.innerHTML = "<p style='color:white'>No featured products.</p>";
      return;
    }

    // Lấy tối đa 10 sản phẩm cho slider
    const featured = products.slice(0, 10);

    featured.forEach((product) => {
      const li = document.createElement("li");
      li.classList.add(
        "swiper-slide",
        "product",
        "type-product",
        "status-publish",
        "instock",
        "has-post-thumbnail",
        "shipping-taxable",
        "purchasable",
        "product-type-simple"
      );

      const imgUrl = getProductImageUrl(product);

      li.innerHTML = `
        <a href="single-product.html?id=${product._id}"
           class="woocommerce-LoopProduct-link woocommerce-loop-product__link">
          <div class="twbb-image-wrap">
            <div class="twbb-image-container" style="aspect-ratio: 1/1;">
              <img
                width="600"
                height="600"
                src="${imgUrl}"
                class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail"
                alt="${product.product_name}"
                data-image="main"
              />
            </div>
          </div>
          <h2 class="woocommerce-loop-product__title">
            ${product.product_name}
          </h2>
          <span class="price">
            <span class="woocommerce-Price-amount amount">
              <bdi>
                <span class="woocommerce-Price-currencySymbol">&#36;</span>${product.price_new}
              </bdi>
            </span>
          </span>
        </a>
        <div class="twbb-add-to-cart-container">
          <a href="#"
             data-quantity="1"
             class="button product_type_simple add_to_cart_button"
             data-product_id="${product._id}"
             aria-label="Add to cart: ${product.product_name}"
             rel="nofollow">
            Add to cart
          </a>
        </div>
      `;

      sliderWrapper.appendChild(li);
    });

    // Nếu bạn có dùng Swiper khởi tạo global, có thể cần update lại
    if (window.swiper && typeof window.swiper.update === "function") {
      window.swiper.update();
    }
  } catch (err) {
    console.error("❌ Error loading featured slider products:", err);
  }
}
