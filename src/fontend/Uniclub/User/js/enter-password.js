document
  .getElementById("form")
  .addEventListener("submit", async function (event) {
    event.preventDefault(); // Ngăn chặn hành động mặc định của form

    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");
    const successMessage = document.getElementById("success-message");

    // Ẩn thông báo trước đó
    errorMessage.style.display = "none";
    successMessage.style.display = "none";

    // Kiểm tra mật khẩu rỗng
    if (!password) {
      errorMessage.innerText = "Vui lòng nhập mật khẩu mới!";
      errorMessage.style.display = "block";
      return;
    }

    // Lấy token và email từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const email = urlParams.get("email");

    if (!token || !email) {
      errorMessage.innerText = "URL không hợp lệ. Vui lòng kiểm tra lại!";
      errorMessage.style.display = "block";
      return;
    }

    // Gửi yêu cầu API đặt lại mật khẩu
    try {
      const response = await fetch("http://localhost:8080/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, token, newPassword: password }),
      });

      const data = await response.json();

      if (response.ok) {
        successMessage.innerText = "Đặt lại mật khẩu thành công!";
        successMessage.style.display = "block";

        // Chuyển hướng sau 3 giây
        setTimeout(() => {
          window.location.href = "account.html"; // Trang đăng nhập
        }, 3000);
      } else {
        errorMessage.innerText =
          data.message || "Đặt lại mật khẩu thất bại. Vui lòng thử lại!";
        errorMessage.style.display = "block";
      }
    } catch (error) {
      console.error("Lỗi:", error);
      errorMessage.innerText = "Đã xảy ra lỗi. Vui lòng thử lại sau!";
      errorMessage.style.display = "block";
    }
  });
