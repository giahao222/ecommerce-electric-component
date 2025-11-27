$(document).ready(function () {
  $(".form_details_user").submit(function (e) {
    e.preventDefault();
    var full_name = $("#display-name").val();
    var jsData = localStorage.getItem("data");
    var email = JSON.parse(jsData).email;

    var phone = $("#phoneNumber").val();
    var address = $("#address").val();
    var password_new = $("#new-pwd").val();
    var password_old = $("#confirm-pwd").val();
    alert("thành công");
    if (password_new !== password_old) {
      alert("Mật khẩu không trùng khớp");
    } else {
      const formData = new FormData();
      const data = {
        name: full_name,
        email: email,
        phone: phone,
        address: address,
        password: password_new,
      };
      formData.append(
        "data",
        new Blob([JSON.stringify(data)], { type: "application/json" })
      );
      axios
        .post("http://localhost:8080/user/updateB", formData, {
          headers: {
            "content-type": "multipart/form-data",
            authorization: `Bearer ${localStorage.getItem("Token")}`,
          },
          timeout: 5000,
        })
        .then((result) => {
          if (!result) {
            alert("Lỗi");
          } else {
            alert("Cập nhật thành công!");
            location.reload();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  });
});
