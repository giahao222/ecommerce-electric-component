$(document).ready(function () {
  fetchCartWithAjax();
});
function fetchCartWithAjax() {
  const token = localStorage.getItem("token");
  console.log(token)
  $.ajax({
    url: "http://localhost:8080/cart-user",
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    success: function (data) {
      console.log(data);
      renderCartAjax(data); // Gọi hàm hiển thị giỏ hàng
    },
    error: function (xhr, status, error) {
      console.error("Lỗi khi tải giỏ hàng:", error);
    },
  });
}
function renderCartAjax(data) {
  // Cập nhật số lượng sản phẩm trong giỏ hàng
  $(".badge.bg-primary").text(data.data.product.length);

  // Lấy phần tử danh sách giỏ hàng
  const cartList = $(".list-group.mb-4");
  cartList.empty(); // Xóa nội dung giỏ hàng cũ trước khi thêm mới
  if (Array.isArray(data.data.product)) {
    // Duyệt qua từng sản phẩm trong giỏ hàng
    data.data.product.forEach((product) => {
      const listItem = `
        <li class="list-group-item d-flex justify-content-between lh-sm">
          <div>
            <h6 class="my-0">${product.ID_product.product_name} x ${product.quantity}</h6>
          </div>
          <span class="text-body-secondary">$${product.price}</span>
        </li>
      `;
      cartList.append(listItem); // Sử dụng jQuery để thêm sản phẩm vào danh sách
    });
  } else {
    console.error("data.data.product không phải là mảng:", data.data.product);
  }

  // Cập nhật tổng giá trị của giỏ hàng
  const totalItem = `
    <li class="list-group-item d-flex justify-content-between">
      <span class="fw-bold">Total (USD)</span>
      <strong>$${data.data.total}</strong>
    </li>
  `;
  cartList.append(totalItem); // Thêm tổng giá trị vào cuối danh sách
}

document
  .getElementById("emailForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value;

    if (!email) {
      alert("Vui lòng nhập địa chỉ email trước khi tiếp tục!");
      return;
    }

    window.location.href =
      "http://127.0.0.1:5500/src/fontend/Uniclub/User/account.html?email=" +
      encodeURIComponent(email);
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
        delete_element_admin();
        // Xóa trạng thái đăng nhập
        localStorage.removeItem("full-name"); // Xóa khỏi localStorage
        localStorage.removeItem("token");
        document.cookie =
          "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
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
load_admin_account();
async function load_admin_account() {
  const token = localStorage.getItem("token");
  fetch("http://localhost:8080/user-information", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Failed to load user information");
      }
    })
    .then((data) => {
      console.log(data);
      if (data.userInformation.email === "admin@gmail.com") {
        create_element_admin();
        console.log(document.cookie); // Hiển thị tất cả cookies hiện tại

      }
      else{
        delete_element_admin();
      }
    })
    .catch((error) => {
      console.error(error);
    });
}
function create_element_admin() {
  // Lấy phần tử 'home-navbar'
  const home_navbar = document.getElementById("home-navbar");

  // Tạo phần tử 'li'
  const li = document.createElement("li");
  li.className = "nav-item"; // Gán class cho 'li'

  // Tạo phần tử 'a'
  const a = document.createElement("a");
  a.href = "http://127.0.0.1:5500/fontend/Uniclub/Admin/index.html"; // Gán href cho 'a'
  a.className = "nav-link mx-2"; // Gán class cho 'a'
  a.textContent = "Admin"; // Gán nội dung text cho 'a'

  // Thêm 'a' vào bên trong 'li'
  li.appendChild(a);

  // Thêm 'li' vào bên trong 'home-navbar'
  home_navbar.appendChild(li);
}

function delete_element_admin() {
  console.log("Đã vào delete");
  console.log(document.cookie); // Hiển thị tất cả cookies hiện tại

  document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  // Lấy phần tử 'home-navbar'
  const home_navbar = document.getElementById("home-navbar");

  // Tìm phần tử 'li' có chứa liên kết đến Admin
  const adminLi = Array.from(home_navbar.querySelectorAll("li.nav-item")).find(
    (li) => {
      const link = li.querySelector("a");
      // So sánh URL tương đối một cách nhất quán
      return (
        link &&
        link.href.includes("Uniclub/Admin/index.html")
      );
    }
  );

  console.log(adminLi); // Kiểm tra kết quả tìm thấy

  // Nếu tìm thấy phần tử 'li', xóa nó
  if (adminLi) {
    home_navbar.removeChild(adminLi);
    console.log("Đã xóa phần tử Admin");
  } else {
    console.log("Không tìm thấy phần tử Admin");
  }
}
