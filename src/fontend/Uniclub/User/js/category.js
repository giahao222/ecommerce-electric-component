// public/js/category.js

document.addEventListener("DOMContentLoaded", () => {
  // Lấy slug từ URL: /category/laptops → "laptops"
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const slug = pathParts[pathParts.length - 1] || "all";

  const productsRoot = document.querySelector("#category-products");
  const paginationRoot = document.querySelector("#category-pagination");

  if (!productsRoot) {
    console.error("❌ Không tìm thấy #category-products trong category.html");
    return;
  }

  /* =====================================================
   * BIẾN PHÂN TRANG
   * ===================================================== */
  let allProducts = [];
  let currentPage = 1;
  const perPage = 6; // 👉 6 sản phẩm / trang

  /* =====================================================
   * FORMAT PRICE
   * ===================================================== */
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

  /* =====================================================
   * RENDER DANH SÁCH SẢN PHẨM THEO TRANG
   * ===================================================== */
  function renderProducts(list = allProducts) {
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    const show = list.slice(start, end);

    const html = show
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

        const detailUrl = `/product/${encodeURIComponent(p.slug || p._id)}`;

        return `
        <li class="product type-product">
          <a href="${detailUrl}" class="woocommerce-LoopProduct-link">
            <div class="twbb-image-wrap">
              <div class="twbb-image-container" style="aspect-ratio: 1/1;">
                ${hasSale ? '<span class="onsale">Sale</span>' : ""}
                <img src="${thumb}" loading="lazy" alt="${name}" />
              </div>
            </div>
            <h2 class="woocommerce-loop-product__title">${name}</h2>
            <span class="price">
              ${
                priceOldText
                  ? `<del><span><bdi>${priceOldText}</bdi></span></del>`
                  : ""
              }
              <ins><span><bdi>${priceNewText}</bdi></span></ins>
            </span>
          </a>
        </li>`;
      })
      .join("");

    productsRoot.innerHTML = html;
  }

  /* =====================================================
   * RENDER PAGINATION
   * ===================================================== */
  function renderPagination() {
    if (!paginationRoot) return;

    const totalPages = Math.ceil(allProducts.length / perPage);
    if (totalPages <= 1) {
      paginationRoot.innerHTML = "";
      return;
    }

    let html = `<button class="page-btn" data-page="${
      currentPage - 1
    }" ${currentPage === 1 ? "disabled" : ""}>Prev</button>`;

    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="page-btn ${
        currentPage === i ? "active" : ""
      }" data-page="${i}">${i}</button>`;
    }

    html += `<button class="page-btn" data-page="${
      currentPage + 1
    }" ${currentPage === totalPages ? "disabled" : ""}>Next</button>`;

    paginationRoot.innerHTML = html;

    paginationRoot.querySelectorAll(".page-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const page = Number(btn.dataset.page);
        const totalPages = Math.ceil(allProducts.length / perPage);

        if (page >= 1 && page <= totalPages) {
          currentPage = page;
          renderProducts();
          renderPagination();
        }
      });
    });
  }

  /* =====================================================
   * FILTER GIÁ — GIỮ NGUYÊN
   * ===================================================== */
  function applyPriceFilter() {
    if (!allProducts.length) return;

    const minInput = document.querySelector(".twwf_min_price_input");
    const maxInput = document.querySelector(".twwf_max_price_input");

    let min = parseFloat(minInput?.value || 0);
    let max = parseFloat(maxInput?.value || Infinity);

    if (isNaN(min)) min = 0;
    if (isNaN(max)) max = Infinity;

    const filtered = allProducts.filter((p) => {
      const price = Number(p.price_new || 0);
      return price >= min && price <= max;
    });

    currentPage = 1;
    renderProducts(filtered);
    renderPagination();
  }

  function initFilters() {
    const btn = document.getElementById("price-filter-apply");
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        applyPriceFilter();
      });
    }

    const minInput = document.querySelector(".twwf_min_price_input");
    const maxInput = document.querySelector(".twwf_max_price_input");

    let lastMin = minInput?.value;
    let lastMax = maxInput?.value;

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

  /* =====================================================
   * FETCH API CATEGORIES
   * ===================================================== */
  async function loadCategoryProducts() {
    const apiUrl = `/api/products/category/${slug}`;
    productsRoot.innerHTML = "<li>Đang tải sản phẩm...</li>";

    try {
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const products = await res.json();

      if (!Array.isArray(products) || products.length === 0) {
        productsRoot.innerHTML =
          "<li>Không có sản phẩm nào trong danh mục này.</li>";
        return;
      }

      allProducts = products;
      currentPage = 1;

      renderProducts();
      renderPagination();
    } catch (err) {
      console.error("🔥 Lỗi load category:", err);
      productsRoot.innerHTML = "<li>Lỗi tải sản phẩm.</li>";
    }
  }

  /* =====================================================
   * INIT
   * ===================================================== */
  loadCategoryProducts();
  initFilters();
});
