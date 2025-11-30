// public/js/product_detail.js
document.addEventListener("DOMContentLoaded", () => {
  // URL: /product/asus-rog-zephyrus-g14
  const parts = window.location.pathname.split("/").filter(Boolean);
  const slug = parts[parts.length - 1];

  const imgEl = document.querySelector(
    ".woocommerce-product-gallery__image img"
  );
  const titleEl = document.querySelector(
    ".elementor-widget-twbb_woocommerce-product-title h1"
  );
  const priceWrap = document.querySelector(
    ".elementor-widget-twbb_woocommerce-product-price .price"
  );
  const shortDescEl = document.querySelector(
    ".woocommerce-product-details__short-description"
  );
  const breadcrumbEl = document.querySelector(".woocommerce-breadcrumb");

  const relatedRoot = document.getElementById("related-products-list");

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

  function renderRelatedItem(p) {
    const name = p.product_name || p.name || "Product";
    const thumb =
      p.thumbnail ||
      p.image ||
      "https://via.placeholder.com/600x600?text=No+Image";

    const priceNew = p.price_new ?? p.price;
    const priceOld = p.price_old ?? null;
    const priceNewText = formatPrice(priceNew);
    const priceOldText = priceOld ? formatPrice(priceOld) : null;
    const hasSale = priceOld && priceOld > priceNew;

    const detailUrl = `/product/${p.slug || p._id}`;

    return `
      <li class="product type-product">
        <a href="${detailUrl}"
           class="woocommerce-LoopProduct-link woocommerce-loop-product__link">
          <div class="twbb-image-wrap">
            <div class="twbb-image-container" style="aspect-ratio:1/1;">
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
          <h2 class="woocommerce-loop-product__title">${name}</h2>
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
  }

  async function loadRelatedProducts(product) {
    if (!relatedRoot) return;
  
    try {
      // Tính slug cho category một cách an toàn
      let categorySlug = "laptops";
  
      if (product.categorySlug) {
        // Trường backend trả sẵn
        categorySlug = product.categorySlug;
      } else if (product.category && typeof product.category === "object") {
        // populate("category") -> object
        if (product.category.slug) {
          categorySlug = product.category.slug;
        } else if (product.category.name) {
          categorySlug = product.category.name.toLowerCase();
        }
      } else if (typeof product.category === "string") {
        // trường hợp chỉ lưu chuỗi
        categorySlug = product.category.toLowerCase();
      }
  
      // (tuỳ chọn) debug thêm
      console.log("👉 categorySlug dùng để gọi API:", categorySlug);
  
      const res = await fetch(
        `/api/products/category/${encodeURIComponent(
          categorySlug
        )}?limit=4&exclude=${product._id}`
      );
      if (!res.ok) throw new Error("HTTP " + res.status);
  
      let list = await res.json();
      list = list.filter((x) => x._id !== product._id).slice(0, 4);
  
      if (!list.length) {
        relatedRoot.innerHTML = "<li>Không có sản phẩm liên quan.</li>";
        return;
      }
  
      relatedRoot.innerHTML = list.map(renderRelatedItem).join("");
    } catch (err) {
      console.error("Lỗi load related products:", err);
      relatedRoot.innerHTML = "<li>Lỗi tải sản phẩm liên quan.</li>";
    }
  }
  

  async function loadProductDetail() {
    try {
      const res = await fetch(`/api/products/slug/${slug}`);
      if (!res.ok) throw new Error("HTTP " + res.status);

      const product = await res.json();

      // Ảnh chính
      const imageUrl =
        product.image ||
        product.thumbnail ||
        "https://via.placeholder.com/800x800?text=No+Image";
      if (imgEl) {
        imgEl.src = imageUrl;
        imgEl.alt = product.product_name || product.name || "";
      }

      // Tiêu đề
      const name = product.product_name || product.name || "Product name";
      if (titleEl) titleEl.textContent = name;

      // Breadcrumb
      if (breadcrumbEl) {
        const categoryText = product.categoryName || "Category";
        breadcrumbEl.innerHTML = `
          <a href="/shop-all">Shop All</a> / 
          <a href="/category/${product.categorySlug || "laptops"}">
            ${categoryText}
          </a> / 
          ${name}
        `;
      }

      // Giá
      const priceNew = product.price_new ?? product.price;
      const priceOld = product.price_old ?? null;
      const priceNewText = formatPrice(priceNew);
      const priceOldText = priceOld ? formatPrice(priceOld) : null;
      const hasSale = priceOld && priceOld > priceNew;

      if (priceWrap) {
        priceWrap.innerHTML = `
          ${
            hasSale
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
        `;
      }

      // Description
      if (shortDescEl) {
        shortDescEl.innerHTML = product.short_description
          ? `<p>${product.short_description}</p>`
          : "<p>No description available.</p>";
      }

      // Load related
      await loadRelatedProducts(product);
    } catch (err) {
      console.error("Lỗi load product detail:", err);
    }
  }

  loadProductDetail();
});
