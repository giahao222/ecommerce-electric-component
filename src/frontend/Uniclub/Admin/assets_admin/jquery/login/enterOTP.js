// Lấy thẻ input
var inputElement = document.querySelector(".time-out");

// Xóa thuộc tính disabled
inputElement.removeAttribute("disabled");

// Đặt giá trị ban đầu
inputElement.value = "30s";

// Thiết lập hàm đếm ngược
var countdown = 30;
var interval = setInterval(function () {
  countdown--;
  inputElement.value = countdown.toString();

  if (countdown === 0) {
    clearInterval(interval);
    window.location.href = "forgot.html";
  }
}, 1000);
$(document).ready(function () {
  $(".forgot-form").submit(function (e) {
    e.preventDefault();
    var opt = $(".otp").val();
    $.ajax({
      method: "GET",
      url: "http://localhost:8080/mail/confirm/" + opt,
      Headers: {
        "Content-Type": "application/json",
      },
    }).done(function (result) {
      if (result.data != null) {
        alert("Success!");
        window.location.href = "reset-password.html";
      } else {
        alert("Code no exist! Please try again.");
      }
    });
  });
});
