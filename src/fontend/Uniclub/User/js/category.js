// public/js/category.js

document.addEventListener("DOMContentLoaded", () => {
  // Lấy slug từ URL: /category/laptops -> "laptops"
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const slug = pathParts[pathParts.length - 1] || "all";

  // UL để render sản phẩm
  const productsRoot = document.querySelector("#category-products");

  if (!productsRoot) {
    console.error(
      "❌ Không tìm thấy phần tử #category-products trong category.html"
    );
    return;
  }

  function formatPrice(value) {
    if (value == null) return "";
    return (
      "$" +
      Number(value).toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
    );
  }

  /* =============  FILTER THEO PRICE (FE) ============= */

  function applyPriceFilter() {
    if (!allProducts.length) return;

    const minInput = document.querySelector(".twwf_min_price_input");
    const maxInput = document.querySelector(".twwf_max_price_input");

    let min = minInput ? parseFloat(minInput.value) : NaN;
    let max = maxInput ? parseFloat(maxInput.value) : NaN;

    if (isNaN(min)) min = 0;
    if (isNaN(max)) max = Infinity;

    const filtered = allProducts.filter((p) => {
      const price = Number(p.price_new || 0);
      return price >= min && price <= max;
    });

    renderProducts(filtered);
  }

  function initFilters() {
    // Nếu bạn vẫn giữ nút Apply thì đoạn này vẫn dùng được
    const btn = document.getElementById("price-filter-apply");
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        applyPriceFilter();
      });
    }

    // --- TỰ ĐỘNG LỌC KHI KÉO SLIDER ---

    const minInput = document.querySelector(".twwf_min_price_input");
    const maxInput = document.querySelector(".twwf_max_price_input");

    let lastMin = minInput ? minInput.value : null;
    let lastMax = maxInput ? maxInput.value : null;

    // Mỗi 300ms kiểm tra xem giá min/max có đổi không,
    // nếu đổi thì apply filter → hiệu ứng giống WooCommerce gốc
    setInterval(() => {
      if (!minInput || !maxInput) return;

      const curMin = minInput.value;
      const curMax = maxInput.value;

      if (curMin !== lastMin || curMax !== lastMax) {
        lastMin = curMin;
        lastMax = curMax;
        applyPriceFilter();
      }
    }, 300);
  }

  // Init
  document.addEventListener("DOMContentLoaded", () => {
    loadCategoryProducts();
    initFilters();
  });

  async function loadCategoryProducts() {
    const apiUrl = `/api/products/category/${slug}`;
    console.log("🔍 Gọi API category:", apiUrl);

    productsRoot.innerHTML = "<li>Đang tải sản phẩm...</li>";

    try {
      const res = await fetch(apiUrl);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} - ${res.statusText}`);
      }

      const products = await res.json();
      console.log("✅ Products from API:", products);

      if (!Array.isArray(products) || products.length === 0) {
        productsRoot.innerHTML =
          "<li>Không có sản phẩm nào trong danh mục này.</li>";
        return;
      }

      const itemsHtml = products
        .map((p) => {
          const name = p.product_name || p.name || "Sản phẩm";
          const thumb =
            p.thumbnail ||
            p.image ||
            "https://via.placeholder.com/600x600?text=No+Image";

          const priceNew = p.price_new ?? p.price;
          const priceOld = p.price_old ?? null;

          const priceNewText = formatPrice(priceNew);
          const priceOldText = priceOld ? formatPrice(priceOld) : null;
          const hasSale = priceOld && priceOld > priceNew;

          const detailUrl = "#"; // sau này bạn thay link chi tiết vào đây

          return `
            <li class="product type-product">
              <a href="${detailUrl}" class="woocommerce-LoopProduct-link woocommerce-loop-product__link">
                <div class="twbb-image-wrap">
                  <div class="twbb-image-container" style="aspect-ratio: 1/1;">
                    ${hasSale ? '<span class="onsale">Sale</span>' : ""}
                    <img
                      width="600"
                      height="600"
                      src="${thumb}"
                      class="attachment-woocommerce_thumbnail size-woocommerce_thumbnail"
                      alt="${name}"
                      loading="lazy"
                    />
                  </div>
                </div>
                <h2 class="woocommerce-loop-product__title">
                  ${name}
                </h2>
                <span class="price">
                  ${
                    priceOldText
                      ? `<del aria-hidden="true">
                           <span class="woocommerce-Price-amount amount">
                             <bdi>${priceOldText}</bdi>
                           </span>
                         </del>`
                      : ""
                  }
                  <ins aria-hidden="true">
                    <span class="woocommerce-Price-amount amount">
                      <bdi>${priceNewText}</bdi>
                    </span>
                  </ins>
                </span>
              </a>
              <div class="twbb-add-to-cart-container">
                <a href="#"
                   class="button product_type_simple add_to_cart_button ajax_add_to_cart"
                   role="button">
                  Add to cart
                </a>
              </div>
            </li>
          `;
        })
        .join("");

      // KHÔNG bọc thêm <ul> nữa, chỉ gán <li> vào UL sẵn
      productsRoot.innerHTML = itemsHtml;
    } catch (err) {
      console.error("🔥 Lỗi load category:", err);
      productsRoot.innerHTML =
        "<li>Lỗi tải sản phẩm. Vui lòng thử lại sau.</li>";
    }
  }

  loadCategoryProducts();
});
