// Hàm thực hiện logout
function logout() {
    // Xóa dữ liệu full_name khỏi localStorage
    localStorage.removeItem("full-name");
    
    const login_account = document.getElementById("login-account");
    login_account.style.display = "block";

    const user_info = document.getElementById("user-info");
    user_info.style.display = "none";
    
    // Gửi yêu cầu đến API server để xử lý logout
    fetch("http://localhost:8080/logout", {
      method: "POST",
      credentials: "include", // Để gửi cookie hoặc token nếu cần
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          // Nếu logout thành công, chuyển hướng về trang đăng nhập
          window.location.href = "account.html";
        } else {
          console.error("Logout failed:", response.status);
        }
      })
      .catch((error) => {
        console.error("Error during logout:", error);
      });
  }
  
  // Gắn sự kiện click cho nút logout
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }
  