// public/js/category.js

document.addEventListener("DOMContentLoaded", () => {
  // Lấy slug từ URL: /category/laptops → "laptops"
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const slug = pathParts[pathParts.length - 1] || "all";

  const productsRoot = document.querySelector("#category-products");
  const paginationRoot = document.querySelector("#category-pagination");

  // ô search
  const searchInput = document.getElementById("category-search-input");
  const searchBtn = document.getElementById("category-search-btn");
  let searchDebounce = null;

  if (!productsRoot) {
    console.error("❌ Không tìm thấy #category-products trong category.html");
    return;
  }

  /* =====================================================
   * BIẾN PHÂN TRANG + LỌC
   * ===================================================== */
  let allProducts = [];
  let filteredProducts = [];
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
  function renderProducts(list = filteredProducts) {
    const total = list.length;

    if (!total) {
      productsRoot.innerHTML = "<li>Không có sản phẩm phù hợp.</li>";
      return;
    }

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

        const priceNew = p.price_new || 0;
        const priceOld = p.price_old || null;

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

    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / perPage);

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
        if (isNaN(page)) return;

        const totalPages = Math.ceil(filteredProducts.length / perPage);

        if (page >= 1 && page <= totalPages) {
          currentPage = page;
          renderProducts();
          renderPagination();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      });
    });
  }

  /* =====================================================
   * SEARCH THEO KEYWORD (trên FE)
   * ===================================================== */
  function applySearch() {
    if (!searchInput) return;

    const keyword = searchInput.value.trim().toLowerCase();

    if (!keyword) {
      // không có keyword -> trả về toàn bộ
      filteredProducts = allProducts.slice();
    } else {
      filteredProducts = allProducts.filter((p) => {
        const name = (p.product_name || p.name || "").toLowerCase();
        const brand = (p.brand || "").toLowerCase();
        const sub = (p.sub_category || "").toLowerCase();

        return (
          name.includes(keyword) ||
          brand.includes(keyword) ||
          sub.includes(keyword)
        );
      });
    }

    currentPage = 1;
    renderProducts();
    renderPagination();
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
        if (paginationRoot) paginationRoot.innerHTML = "";
        return;
      }

      allProducts = products;
      filteredProducts = allProducts.slice();
      currentPage = 1;

      renderProducts();
      renderPagination();
    } catch (err) {
      console.error("🔥 Lỗi load category:", err);
      productsRoot.innerHTML = "<li>Lỗi tải sản phẩm.</li>";
      if (paginationRoot) paginationRoot.innerHTML = "";
    }
  }

  /* =====================================================
   * GẮN EVENT SEARCH
   * ===================================================== */
  if (searchBtn) {
    searchBtn.addEventListener("click", (e) => {
      e.preventDefault();
      applySearch(); // vẫn giữ nút Search cho tiện
    });
  }
  
  if (searchInput) {
    // Gõ tới đâu search tới đó (debounce 300ms)
    searchInput.addEventListener("keyup", () => {
      clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        applySearch();
      }, 300);
    });

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        clearTimeout(searchDebounce);
        applySearch();
      }
    });
  }

  /* =====================================================
   * INIT
   * ===================================================== */
  loadCategoryProducts();
});