const urlParams = new URLSearchParams(window.location.search);
const emailParam = urlParams.get("email");

// Kiểm tra xem có email trong URL không
if (emailParam) {
  // Hiển thị tab "Đăng ký"
  document.getElementById("nav-register-tab").classList.add("active");
  document.getElementById("nav-sign-in-tab").classList.remove("active");
  document.getElementById("nav-register").classList.add("show", "active");
  document.getElementById("nav-sign-in").classList.remove("show", "active");

  // Điền email vào form đăng ký
  document.getElementById("exampleInputEmail1").value = emailParam;
}
document.getElementById("form1").addEventListener("submit", async function (e) {
  e.preventDefault(); // Ngừng hành động mặc định của form (không reload trang)

  const email = document.getElementById("exampleInputEmail1").value;
  const full_name = document.getElementById("exampleInputName1").value;
  const password = document.getElementById("inputPassword1").value;
  const confirmPassword = document.getElementById("inputPassword2").value;
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // Kiểm tra nếu mật khẩu và xác nhận mật khẩu không khớp
  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  // Tạo đối tượng chứa thông tin đăng ký
  const requestBody = {
    email,
    password,
    full_name,
  };

  try {
    // Gửi POST request tới API backend
    const response = await fetch("http://localhost:8080/create-account", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    if (response.ok) {
      // Nếu đăng ký thành công
      document.getElementById("success-message1").textContent = result.message;
      document.getElementById("success-message1").style.display = "block";
      document.getElementById("error-message1").style.display = "none";
    } else {
      // Nếu có lỗi từ server
      document.getElementById("error-message1").textContent = result.errors
        ? result.errors.map((error) => error.msg).join(", ")
        : result.message;
      document.getElementById("error-message1").style.display = "block";
      document.getElementById("success-message1").style.display = "none";
    }
  } catch (error) {
    console.error("Error during registration:", error);
    document.getElementById("error-message1").textContent =
      "An error occurred while processing your request.";
    document.getElementById("error-message1").style.display = "block";
    document.getElementById("success-message1").style.display = "none";
  }
});
document.getElementById("form").addEventListener("submit", async function (e) {
  e.preventDefault(); // Ngừng hành động mặc định của form (không reload trang)

  const email = document.getElementById("exampleInputEmail").value;
  const password = document.getElementById("inputPassword").value;

  // Tạo đối tượng chứa thông tin đăng ký
  const requestBody = {
    email,
    password,
  };

  try {
    // Gửi POST request tới API backend
    const response = await fetch("http://localhost:8080/login-normal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();
    console.log(result);
    if (response.ok) {
      // Nếu đăng ký thành công
      localStorage.setItem("token", result.token);

      // Chuyển hướng đến trang chủ sau khi đăng nhập thành công
      window.location.href =
        `/fontend/Uniclub/User/home.html?full_name=` + result.full_name;
      return;
    } else {
      // Nếu có lỗi từ server
      document.getElementById("error-message").textContent = result.message;
      document.getElementById("error-message").style.display = "block";
    }
  } catch (error) {
    console.error("Error during login:", error);
    document.getElementById("error-message").textContent =
      "An error occurred while processing your request.";
    document.getElementById("error-message").style.display = "block";
  }
});
