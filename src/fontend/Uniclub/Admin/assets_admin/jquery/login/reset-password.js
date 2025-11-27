$(document).ready(function () {
  $(".login-form").submit(function (e) {
    e.preventDefault();
    var password = $(".password-reseted").val();
    var email = localStorage.getItem("email");
    $.ajax({
      method: "POST",
      url: "http://localhost:8080/mail/" + email + "/" + password,
      Headers: {
        "Content-Type": "application/json",
      },
    }).done(function (result) {
      if (result.data != null) {
        alert("Congratolation!");
        window.location.href = "signin.html";
      }
    });
  });
});
