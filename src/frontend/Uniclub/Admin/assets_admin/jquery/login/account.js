$(document).ready(function () {
  $("#form_login").submit(function (e) {
    e.preventDefault();
    var username = $("#username").val();
    var password = $("#password").val();
    $.ajax({
      method: "POST",
      url: "http://localhost:8080/sign-in",
      Headers: {
        "Content-Type": "application/json",
      },
      data: {
        username: username,
        password: password,
      },
    }).done(function (result) {
      if (result.data != null) {
        localStorage.setItem("Token", result.data.token);
        localStorage.setItem("username", result.data.username);
        if (result.data.role == "Admin") {
          window.location.href = "index.html";
        } else {
          window.location.href = "index_logined.html";
        }
      } else {
        alert("Tài khoản hoặc mật khẩu không chính xác!");
      }
    });
  });
});
