document.addEventListener("DOMContentLoaded", function () {
  const productsPerPage = 12; // Số lượng sản phẩm mỗi trang
  let currentPage = 1; // Trang hiện tại
  let totalProducts = 0; // Tổng số sản phẩm
  let totalPages = 0; // Tổng số trang

  function fetchProducts() {
    fetch("http://localhost:8080/products")
      .then((response) => response.json())
      .then((responseData) => {
        const data = responseData.data;

        // Lưu dữ liệu vào localStorage dưới dạng JSON string
        localStorage.setItem("list-product", JSON.stringify(data));

        // Cập nhật tổng số sản phẩm và tổng số trang
        const totalProducts = data.length;
        const productsPerPage = 10; // Số sản phẩm mỗi trang
        const totalPages = Math.ceil(totalProducts / productsPerPage);

        // Cập nhật danh sách sản phẩm hiển thị
        updateProductList(data);

        console.log(
          `Total Products: ${totalProducts}, Total Pages: ${totalPages}`
        );
      })
      .catch((error) => {
        console.error("Error fetching products:", error);
      });
  }

  // Hàm để cập nhật danh sách sản phẩm và hiển thị phân trang
  function updateProductList(products) {
    const productContainer = document.getElementById("product-container");
    productContainer.innerHTML = ""; // Xóa danh sách sản phẩm hiện tại
    console.log(products);
    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const paginatedProducts = products.slice(start, end);
    console.log(paginatedProducts);
    // Hiển thị sản phẩm
    paginatedProducts.forEach((product) => {
      const productElement = document.createElement("div");
      productElement.classList.add("col-md-6", "col-lg-4", "my-4");
      productElement.innerHTML = `
                <div class="product-item">
                    <div class="image-holder" style="width: 100%; height: 100%;">
                        <img src="images/item1.jpg" alt="${product.product.product_name}" class="product-image img-fluid">
                    </div>
                    <div class="cart-concern">
                        <div class="cart-button d-flex justify-content-between align-items-center">
                            <a href="#" class="btn-wrap cart-link d-flex align-items-center text-capitalize fs-6 ">add to cart <i class="icon icon-arrow-io pe-1"></i></a>
                            <a href="single-product.html?id=${product.product._id}" class="view-btn">
                                <i class="icon icon-screen-full"></i>
                            </a>
                            <a href="#" class="wishlist-btn">
                                <i class="icon icon-heart"></i>
                            </a>
                        </div>
                    </div>
                    <div class="product-detail d-flex justify-content-between align-items-center mt-4">
                        <h4 class="product-title mb-0">
                            <a href="single-product.html">${product.product.product_name}</a>
                        </h4>
                        <p class="m-0 fs-5 fw-normal">$${product.product.price_new}</p>
                    </div>
                </div>
            `;
      productContainer.appendChild(productElement);
    });

    // Cập nhật thông tin "Showing X–Y of Z results"
    document.querySelector(".showing-product p").innerHTML = `Showing ${
      start + 1
    }–${Math.min(end, totalProducts)} of ${totalProducts} results`;

    // Cập nhật phân trang
    updatePagination();

    // Cuộn lên đầu danh sách sản phẩm
    window.scrollTo(0, 0);
  }

  // Hàm để cập nhật phân trang
  function updatePagination() {
    const paginationContainer = document.getElementById("pagination");
    if (!paginationContainer) {
      console.error("Pagination container not found!");
      return; // Nếu không tìm thấy phần tử, dừng lại
    }

    paginationContainer.innerHTML = ""; // Xóa phân trang cũ

    // Thêm nút "Previous"
    const prevPage = document.createElement("a");
    prevPage.href = "#";
    prevPage.classList.add(
      "pagination-arrow",
      "d-flex",
      "align-items-center",
      "mx-3"
    );
    prevPage.innerHTML =
      '<iconify-icon icon="ic:baseline-keyboard-arrow-left" class="pagination-arrow fs-1"></iconify-icon>';
    prevPage.addEventListener("click", (e) => {
      e.preventDefault();
      changePage(currentPage - 1);
    });
    if (currentPage === 1) {
      prevPage.style.visibility = "hidden"; // Ẩn nút Previous nếu đang ở trang đầu
    }
    paginationContainer.appendChild(prevPage);

    // Thêm các nút trang
    for (let i = 1; i <= totalPages; i++) {
      const pageButton = document.createElement("span");
      pageButton.classList.add("page-numbers", "mt-2", "fs-3", "mx-3");
      if (i === currentPage) {
        pageButton.classList.add("current");
      }
      pageButton.innerText = i;
      pageButton.addEventListener("click", (e) => {
        e.preventDefault();
        changePage(i);
      });
      paginationContainer.appendChild(pageButton);
    }

    // Thêm nút "Next"
    const nextPage = document.createElement("a");
    nextPage.href = "#";
    nextPage.classList.add(
      "pagination-arrow",
      "d-flex",
      "align-items-center",
      "mx-3"
    );
    nextPage.innerHTML =
      '<iconify-icon icon="ic:baseline-keyboard-arrow-right" class="pagination-arrow fs-1"></iconify-icon>';
    nextPage.addEventListener("click", (e) => {
      e.preventDefault();
      changePage(currentPage + 1);
    });
    if (currentPage === totalPages) {
      nextPage.style.visibility = "hidden"; // Ẩn nút Next nếu đang ở trang cuối
    }
    paginationContainer.appendChild(nextPage);
  }

  // Hàm để thay đổi trang
  function changePage(page) {
    if (page >= 1 && page <= totalPages) {
      currentPage = page;
      fetchProducts(); // Gọi lại hàm fetch để lấy sản phẩm của trang mới
    }
  }

  // Gọi lần đầu để lấy danh sách sản phẩm
  fetchProducts();
});

(function handleAuth() {
  // Loại bỏ hash `#_=_` nếu có trong URL
  if (window.location.hash === "#_=_") {
    history.replaceState
      ? history.replaceState(null, null, window.location.href.split("#")[0])
      : (window.location.hash = "");
  }

  // Lấy query string từ URL
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  // Lấy thông tin full_name từ URL
  let fullName = urlParams.get("full_name");

  // Lấy các phần tử giao diện
  const loginIcon = document.getElementById("login-icon");
  const userInfo = document.getElementById("user-info");
  const userNameElement = document.getElementById("user-name");
  const logoutBtn = document.getElementById("logout-btn");

  // Nếu full_name tồn tại trong URL, lưu vào localStorage
  if (fullName) {
    const decodedFullName = decodeURIComponent(fullName);
    localStorage.setItem("full-name", decodedFullName); // Lưu vào localStorage
    fullName = decodedFullName; // Gán lại giá trị
  } else {
    // Nếu không có trong URL, lấy từ localStorage
    fullName = localStorage.getItem("full-name");
  }

  // Xử lý giao diện dựa trên trạng thái đăng nhập
  if (fullName) {
    console.log("Người dùng đã đăng nhập:", fullName);

    // Ẩn icon đăng nhập
    const iconLoginAccount = document.getElementById("login-account");
    if (iconLoginAccount) iconLoginAccount.style.display = "none";

    // Hiển thị tên người dùng và nút đăng xuất
    if (userInfo) {
      userInfo.style.display = "flex";
      userNameElement.textContent = fullName;
    }

    // Thêm sự kiện cho nút đăng xuất
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        
        delete_element_admin()
        // Xóa trạng thái đăng nhập
        localStorage.removeItem("full-name"); // Xóa khỏi localStorage
        localStorage.removeItem("token")
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        window.location.href = "account.html"; // Chuyển hướng về trang đăng nhập
      });
    }
  } else {
    console.log("Người dùng chưa đăng nhập.");

    // Hiển thị icon đăng nhập, ẩn thông tin người dùng
    if (loginIcon) loginIcon.style.display = "block";
    if (userInfo) userInfo.style.display = "none";
  }
})();
// load_admin_account();
// function load_admin_account() {
//   const token = localStorage.getItem("token");
//   fetch("http://localhost:8080/user-information", {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   })
//     .then((response) => {
//       if (response.ok) {
//         return response.json();
//       } else {
//         throw new Error("Failed to load user information");
//       }
//     })
//     .then((data) => {
//       console.log(data);
//       if (data.userInformation.email === "admin@gmail.com") {
//         create_element_admin();
//         console.log(document.cookie); // Hiển thị tất cả cookies hiện tại

//       }
//       else{
//         delete_element_admin();
//       }
//     })
//     .catch((error) => {
//       console.error(error);
//     });
// }
// function create_element_admin() {
//   // Lấy phần tử 'home-navbar'
//   const home_navbar = document.getElementById("home-navbar");

//   // Tạo phần tử 'li'
//   const li = document.createElement("li");
//   li.className = "nav-item"; // Gán class cho 'li'

//   // Tạo phần tử 'a'
//   const a = document.createElement("a");
//   a.href = "/src/fontend/Uniclub/Admin/index.html"; // Gán href cho 'a'
//   a.className = "nav-link mx-2"; // Gán class cho 'a'
//   a.textContent = "Admin"; // Gán nội dung text cho 'a'

//   // Thêm 'a' vào bên trong 'li'
//   li.appendChild(a);

//   // Thêm 'li' vào bên trong 'home-navbar'
//   home_navbar.appendChild(li);
// }

// function delete_element_admin() {
//   console.log("Đã vào delete");
//   console.log(document.cookie); // Hiển thị tất cả cookies hiện tại

//   document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

//   // Lấy phần tử 'home-navbar'
//   const home_navbar = document.getElementById("home-navbar");

//   // Tìm phần tử 'li' có chứa liên kết đến Admin
//   const adminLi = Array.from(home_navbar.querySelectorAll("li.nav-item")).find(
//     (li) => {
//       const link = li.querySelector("a");
//       // So sánh URL tương đối một cách nhất quán
//       return (
//         link &&
//         link.href.includes("Uniclub/Admin/index.html")
//       );
//     }
//   );

//   console.log(adminLi); // Kiểm tra kết quả tìm thấy

//   // Nếu tìm thấy phần tử 'li', xóa nó
//   if (adminLi) {
//     home_navbar.removeChild(adminLi);
//     console.log("Đã xóa phần tử Admin");
//   } else {
//     console.log("Không tìm thấy phần tử Admin");
//   }
// }

