document.getElementById("form").addEventListener("submit", function(event) {
    event.preventDefault(); // Ngăn chặn hành động mặc định của form

    send_mail();
  });

  function send_mail() {
    const email = document.getElementById("email").value;
    const errorMessage = document.getElementById("error-message");
    const successMessage = document.getElementById("success-message");

    // Ẩn các thông báo trước đó
    errorMessage.style.display = "none";
    successMessage.style.display = "none";

    // Kiểm tra nếu email rỗng
    if (!email) {
      errorMessage.innerText = "Vui lòng nhập địa chỉ email!";
      errorMessage.style.display = "block";
      return;
    }

    // Gửi yêu cầu API
    fetch("http://localhost:8080/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email }) // Truyền email trong phần body của request
    })
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error("Có lỗi xảy ra khi gửi yêu cầu quên mật khẩu!");
        }
      })
      .then(data => {
        console.log("Email reset password đã được gửi:", data);

        // Hiện thông báo thành công
        successMessage.innerText = "Hãy kiểm tra email của bạn!";
        successMessage.style.display = "block";

        // Chờ 3 giây rồi điều hướng
        setTimeout(() => {
          window.location.href = "account.html"; // Điều hướng về trang account.html
        }, 3000);
      })
      .catch(error => {
        console.error("Lỗi:", error);

        // Hiện thông báo lỗi
        errorMessage.innerText = "Không thể gửi email quên mật khẩu. Vui lòng thử lại!";
        errorMessage.style.display = "block";
      });
  }