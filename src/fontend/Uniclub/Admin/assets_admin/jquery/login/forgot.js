$(document).ready(function () {
  $(".forgot-form").submit(function (e) {
    e.preventDefault();
    var username = $(".username").val();
    $.ajax({
      method: "POST",
      url: "http://localhost:8080/mail/send/" + username,
      Headers: {
        "Content-Type": "application/json",
      },
    }).done(function (result) {
      if (result.data != null) {
        alert("Email Sent Successfully, Please check your inbox");
        localStorage.setItem("email",result.data);
        window.location.href = "enterOTP.html";
      } else {
        alert("Email không tồn tại");
      }
    });
  });
});
