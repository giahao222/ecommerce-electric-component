document.addEventListener("DOMContentLoaded", function () {
  // Lấy productId từ URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");
  
  // Gọi hàm khi trang tải
  fetchReviews(productId);
  if (productId) {
    // Gửi yêu cầu tới API để lấy chi tiết sản phẩm theo ID
    fetch(`http://localhost:8080/product?id=${productId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((product) => {
        if (!product || !product.data) {
          throw new Error("Product data is missing or invalid");
        }
        updateProductDetails(product);
        check_quantity(product.data.product_details.quantity);
        console.log("Product data:", product);
        add_to_cart(productId);
      })
      .catch((error) => {
        console.error("Error fetching product details:", error);
      });
  }
});
function check_quantity(total){
  const quantityInput = document.getElementById("quantity");
  const btnMinus = document.querySelector(".quantity-left-minus");
  const btnPlus = document.querySelector(".quantity-right-plus");
  // Giảm số lượng
  btnMinus.addEventListener("click", function () {
      let currentValue = parseInt(quantityInput.value, 10);
      if (currentValue < 1) {
          quantityInput.value = 1;
      }
  });
  
  // Tăng số lượng
  btnPlus.addEventListener("click", function () {
      let currentValue = parseInt(quantityInput.value, 10);
      if (currentValue < total) {
          quantityInput.value = currentValue + 1;
      }
      if (currentValue > total) {
        quantityInput.value = total;
    }
  });

  // Kiểm tra giới hạn khi người dùng nhập thủ công
  quantityInput.addEventListener("input", function () {
      let currentValue = parseInt(quantityInput.value, 10);
      if (isNaN(currentValue) || currentValue < 1) {
          quantityInput.value = 1;
      } else if (currentValue > total) {
          quantityInput.value = total;
      }
  });
}



// Hàm để cập nhật giao diện sản phẩm
function updateProductDetails(product) {
  if (!product) return;

  // Giả sử bạn có các phần tử HTML để hiển thị chi tiết sản phẩm
  const productNameElement = document.getElementById("product-name");
  const productPriceElement = document.getElementById("product-price");
  const productPriceOld = document.getElementById("product-price-old");
  const productStarElement = document.getElementById("product-star");
  const productDescriptionElement = document.getElementById(
    "product-description"
  );
  const productImageElement = document.getElementById("product-image");
  const productSkuElement = document.getElementById("product-sku");
  const productInfElement = document.getElementById("product-Inf");

  // Cập nhật thông tin sản phẩm vào các phần tử HTML
  if (productNameElement) {
    productNameElement.textContent = product.data.product.product_name;
    console.log(product.data.product_details);
  }
  if (productPriceElement) {
    productPriceElement.textContent = `$${product.data.product.price_new}`;
  }
  if (productPriceOld) {
    productPriceOld.textContent = `$${product.data.product.price_old}`;
  }
  const starRating = `${product.data.product.star}`; // Giá trị star được lấy từ API
  const stars = document.querySelectorAll(".rating-star");

  // Lặp qua các biểu tượng sao và cập nhật sao đầy/nửa/rỗng
  stars.forEach((star, index) => {
    if (index < Math.floor(starRating)) {
      // Đổi thành sao đầy (solid star)
      star.setAttribute("icon", "clarity:star-solid");
    } else if (index < Math.ceil(starRating)) {
      // Đổi thành sao nửa (half star)
      star.setAttribute("icon", "clarity:half-star-solid");
    } else {
      // Đổi thành sao rỗng (empty star)
      star.setAttribute("icon", "clarity:star-line");
    }
  });
  if (productStarElement) {
    productStarElement.textContent = `Rating: ${product.data.product.star} stars`;
  }
  if (productDescriptionElement) {
    productDescriptionElement.textContent = product.data.product.description;
  }
  if (productImageElement) {
    productImageElement.src = `path_to_images/${product.data.product.image}`; // Ví dụ về hình ảnh
  }
  if (productSkuElement) {
    productSkuElement.textContent = `${product.data.product.sku}`;
  }
  if (productInfElement) {
    productInfElement.textContent = product.data.product.information;
  }
  renderColors(product.data.product_details.ID_color);
  renderSizes(product.data.product_details.ID_size);
  renderCategories(product.data.product_details.ID_category);
  renderTags(product.data.product_details.ID_tag);
}
function renderColors(colors) {
  const colorList = document.querySelector(".select-list-color"); // Lấy danh sách UL
  colorList.innerHTML = ""; // Xóa danh sách cũ (nếu có)

  colors.forEach((color) => {
    // Tạo phần tử li
    const listItem = document.createElement("li");
    listItem.classList.add("select-item", "pe-3");
    listItem.setAttribute("data-val", color.name);
    listItem.setAttribute("title", color.name);

    // Tạo nút bên trong li
    const link = document.createElement("a");
    link.classList.add("btn", "btn-light", "fs-6" , "btn-color"); // Class mặc định
    link.innerText = color.name; // Hiển thị tên màu

    // Thêm nút vào li
    listItem.appendChild(link);

    // Thêm li vào danh sách UL
    colorList.appendChild(listItem);
  });
  const colorItems = document.querySelectorAll(".btn-color");
  
  colorItems.forEach((item) => {
    item.addEventListener("click", function () {
      // Loại bỏ lớp active khỏi tất cả các phần tử
      colorItems.forEach((el) => el.classList.remove("active"));
      
      // Thêm lớp active vào phần tử được click
      this.classList.add("active");
    });
  });
}
  function renderSizes(sizes) {
    const sizeList = document.querySelector(".select-list-size"); // Lấy danh sách UL
    sizeList.innerHTML = ""; // Xóa danh sách cũ (nếu có)
  
    sizes.forEach((size) => {
      // Tạo phần tử li
      const listItem = document.createElement("li");
      listItem.classList.add("select-item", "pe-3");
      listItem.setAttribute("data-val", size.name);
      listItem.setAttribute("title", size.name);
  
      // Tạo nút bên trong li
      const link = document.createElement("a");
      link.classList.add("btn", "btn-light", "fs-6" , "btn-size"); // Class mặc định
      link.innerText = size.name; // Hiển thị tên màu
  
      // Thêm nút vào li
      listItem.appendChild(link);
  
      // Thêm li vào danh sách UL
      sizeList.appendChild(listItem);
    });
    const sizeItems = document.querySelectorAll(".btn-size");
    
    sizeItems.forEach((item) => {
      item.addEventListener("click", function () {
        // Loại bỏ lớp active khỏi tất cả các phần tử
        sizeItems.forEach((el) => el.classList.remove("active"));
        
        // Thêm lớp active vào phần tử được click
        this.classList.add("active");
      });
    });
}
function renderCategories(categories) {
  const categoryList = document.querySelector(".select-list-category");
  categoryList.innerHTML = "";

  categories.forEach((category, index) => {
      // Tạo phần tử <li>
      const listItem = document.createElement("li");
      listItem.classList.add("select-item");
      listItem.setAttribute("data-value", category._id);

      // Tạo thẻ <a> bên trong <li>
      const link = document.createElement("a");
      link.href = "#";  // Có thể thay đổi nếu muốn thêm liên kết thật
      link.textContent = category.name; // Hiển thị tên category

      // Thêm <a> vào <li>
      listItem.appendChild(link);

      // Thêm <li> vào UL
      categoryList.appendChild(listItem);

      if (index !== categories.length - 1) {
          const comma = document.createElement("span");
          comma.textContent = ", ";
          listItem.appendChild(comma);
      }
  });
}
function renderTags(tags) {
  const tagList = document.querySelector(".select-list-tag");
  tagList.innerHTML = "";

  tags.forEach((tag, index) => {
      // Tạo phần tử <li>
      const listItem = document.createElement("li");
      listItem.classList.add("select-item");
      listItem.setAttribute("data-value", tag._id);

      // Tạo thẻ <a> bên trong <li>
      const link = document.createElement("a");
      link.href = "#";  // Có thể thay đổi nếu muốn thêm liên kết thật
      link.textContent = tag.name; // Hiển thị tên category

      // Thêm <a> vào <li>
      listItem.appendChild(link);

      // Thêm <li> vào UL
      tagList.appendChild(listItem);

      if (index !== tags.length - 1) {
          const comma = document.createElement("span");
          comma.textContent = ", ";
          listItem.appendChild(comma);
      }
  });
}
function add_to_cart(id){
  document.querySelector(".btn-cart").addEventListener("click", function (e) {
    e.preventDefault();

    const color = document.querySelector(".btn-color.active").innerText;
    const size = document.querySelector(".btn-size.active").innerText;
    const quantity = parseInt(document.getElementById("quantity").value, 10);
    const price = document.getElementById("product-price").innerText.trim().replace("$", "");
    if (!color || !size) {
        alert("Vui lòng chọn đầy đủ màu sắc và kích thước!");
        return;
    }

    const payload = {
        ID_product: id,
        color_name: color,
        size_name: size,
        price: parseInt(price),
        quantity: quantity
    };
    fetch("http://localhost:8080/add-cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(payload)
    })
        .then(response => response.json())
        .then(data => {
          console.log("Backend response:", data);
          fetchCartWithAjax();
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Có lỗi xảy ra. Vui lòng thử lại!");
        });
});
}
document.getElementById("form-review").addEventListener("submit", async function (e) {
  e.preventDefault(); // Ngăn form reload trang mặc định

  // Lấy số sao (rating)
  const ratingValue = document.getElementById("rating-value").textContent.trim();
  console.log(ratingValue);
  // Lấy nội dung review
  const reviewContent = document.querySelector("textarea").value.trim();

  // Kiểm tra nếu người dùng chưa chọn số sao hoặc chưa nhập nội dung
  if (!ratingValue || !reviewContent) {
    alert("Please select a rating and write your review.");
    return;
  }

  // Gửi yêu cầu POST
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");
    const response = await fetch(`http://localhost:8080/review`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`, // Thêm token nếu cần
      },
      body: JSON.stringify({
        review_content: reviewContent,
        star: parseInt(ratingValue),
        product_id: productId,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      alert("Review added successfully!");
      location.reload();
    } else {
      console.error("Error adding review:", result.message);
      alert("Error: " + result.message);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong. Please try again.");
  }
});
// Hàm gọi API để lấy dữ liệu đánh giá
async function fetchReviews(productId) {
  try {
    const response = await fetch(
      `http://localhost:8080/reviews?product_id=${productId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch reviews");
    }

    const result = await response.json();
    if (result.data) {
      console.log(result.data.information_review);
      renderReviews(result.data.information_review); // Hiển thị các đánh giá
    } else {
      document.querySelector(".reviews-container").innerHTML =
        "<p>No reviews available for this product.</p>";
    }
  } catch (error) {
    console.error("Error fetching reviews:", error);
  }
}
async function getID_curent(token) {
  try {
    const res = await fetch('http://localhost:8080/user-information', {
      method: "GET", // Đặt đúng cú pháp
      headers: {
        Authorization: "Bearer " + token, // Đúng chính tả
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json(); // Chờ kết quả JSON
    return data; // Trả về kết quả nếu cần
  } catch (error) {
    console.error("Error fetching user information:", error);
  }
}

// Hàm hiển thị đánh giá vào HTML
async function renderReviews(reviews) {
  const reviewsContainer = document.querySelector(".review-box");
  reviewsContainer.innerHTML = ""; // Xóa nội dung cũ
  const data_user = await getID_curent(localStorage.getItem("token"));
  reviews.forEach((review) => {
    const { id_user, star, review_content, createdAt } = review;
    // Render số sao
    let starsHTML = "";
    for (let i = 1; i <= 5; i++) {
      starsHTML += `
        <div class="rating" data-rating="${i}">
          <svg width="24" height="24" class="${
            i <= star ? "text-primary" : "text-secondary"
          }">
            <use xlink:href="#star-solid"></use>
          </svg>
        </div>
      `;
    }

    // Thêm nội dung đánh giá
    reviewsContainer.innerHTML += `
      <div class="col-lg-6 d-flex flex-wrap gap-3">
        <div class="col-md-2">
          <div class="image-holder">
            <img src="images/reviewer-${Math.floor(Math.random() * 3) + 1}.jpg" 
                 alt="review" 
                 class="img-fluid rounded-circle">
          </div>
        </div>
        <div class="col-md-8">
          <div class="review-content">
            <div class="rating-container d-flex align-items-center">
              ${starsHTML}
              <span class="rating-count">(${star})</span>
              ${
                id_user._id === data_user.userInformation.id
                  ? `<div class="cart-remove" data>
                      <a href="#" data-value="${review._id}" class="delete-review">
                        <svg width="24" height="24">
                          <use xlink:href="#trash"></use>
                        </svg>
                      </a>
                    </div>`
                  : ""
              }
            </div>
            <div class="review-header">
              <span class="author-name text-black fw-bold">${id_user.full_name || "Anonymous"}</span>
              <span class="review-date">– ${new Date(createdAt).toLocaleDateString()}</span>
              
            </div>
            <p>${review_content}</p>
          </div>
        </div>
      </div>
    `;
  });
}
document.addEventListener("click", async (event) => {
  // Kiểm tra xem có nhấn vào nút xóa không
  if (event.target.closest(".delete-review")) {
    event.preventDefault(); // Ngừng hành vi mặc định

    const deleteButton = event.target.closest(".delete-review"); // Lấy nút xóa
    const reviewId = deleteButton.getAttribute("data-value"); // Lấy ID của review
    if (!reviewId) {
      console.error("Review ID not found");
      return;
    }

    // Hiển thị hộp thoại xác nhận
    if (!confirm("Are you sure you want to delete this review?")) {
      return;
    }

    // Lấy product_id từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id"); // Lấy id của sản phẩm từ URL

    if (!productId) {
      console.error("Product ID not found");
      return;
    }

    try {
      // Gửi yêu cầu xóa review qua AJAX
      const res = await fetch('http://localhost:8080/review', {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`, // Thêm token nếu cần
        },
        body: JSON.stringify({
          product_id: productId, // Gửi product_id
          review_id: reviewId // Gửi review_id
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to delete review: ${res.statusText}`);
      }

      const result = await res.json();
      console.log("Review deleted successfully:", result);
      fetchReviews(productId);
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review. Please try again.");
    }
  }
});