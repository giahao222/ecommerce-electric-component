let total_price = 0;
load_information();
function load_information() {
  const token = localStorage.getItem("token");
  console.log(token);
  $.ajax({
    url: "http://localhost:8080/cart-user",
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    success: function (data) {
      console.log(data.data.total);
      const total1 = document.querySelector(".totalPrice1");
      total1.textContent = data.data.total;
      const total2 = document.querySelector(".totalPrice1");
      total2.textContent = data.data.total;
      total_price = data.data.total;
    },
    error: function (xhr, status, error) {
      console.error("Lỗi khi tải giỏ hàng:", error);
    },
  });
}
document.addEventListener("DOMContentLoaded", function () {
  const checkoutForm = document.getElementById("checkout-form");
  checkoutForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Ngăn biểu mẫu gửi theo cách thông thường

    // Lấy thông tin từ các trường trong biểu mẫu
    const formData = {
      name: document.getElementById("fname").value,
      address: document.getElementById("adr").value,
      city: document.getElementById("city").value,
      phone: document.getElementById("phone").value,
      email_address: document.getElementById("email").value,
      note: checkoutForm.querySelector("textarea").value,
      payment_name: document.getElementById("name-payment").textContent.trim(),
      total: total_price, // Có thể thay bằng giá trị động từ giỏ hàng
    };
    console.log(formData);
    // Hiển thị thông báo lỗi nếu thiếu thông tin
    if (!formData.payment_name) {
      const errorMessage = document.getElementById("error-message");
      errorMessage.textContent = "Please select a payment method.";
      errorMessage.style.display = "block";
      return;
    }
    // Gửi dữ liệu đến server qua Fetch API
    try {
      // Gửi dữ liệu đến API confirm_pay
      const response = await fetch("http://localhost:8080/confirm-pay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();

        // Chuyển hướng đến URL thanh toán
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          throw new Error("No redirect URL provided.");
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to process payment.");
      }
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = document.getElementById("error-message");
      errorMessage.textContent = error.message;
      errorMessage.style.display = "block";
    }
  });
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
