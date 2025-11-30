    // Kiểm tra khi click vào edit_product
    $(document).on("click", ".add_attribute", function () {
      console.log("Add Attribute clicked");
    //   var attributeID = $(this).data("attribute-id"); // Lấy ID sản phẩm từ data attribute
    //   console.log("Attribute ID:", attributeID); // In ID sản phẩm ra console
  
      // Hiển thị form chỉnh sửa
      $("#main_index").css("filter", "blur(5px)");
      $("#add-attribute").css("display", "flex");
      // Gọi hàm fetchProductData để lấy dữ liệu sản phẩm
    //   fetchProductData(attributeID);
    //   Edit_Button(productId);
    });
  
    // Đóng popup khi nhấn nút Cancel
    $("#closePopup").click(function () {
      $("#add-attribute").css("display", "none");
      $("#main_index").css("filter", "none");
    });
  $('#addAttributeForm').submit(function(event) {
    event.preventDefault(); // Ngừng reload trang

    const attributeName = $('#name-category').val();
    const attributeType = $('#attributeType').val();

    $.ajax({
        method: "POST",
        url: "http://localhost:8080/add-attribute", // Địa chỉ API POST để thêm thuộc tính
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("Token"),
            "Content-Type": "application/json"
        },
        data: JSON.stringify({
            name: attributeName,
            type: attributeType
        })
    }).done(function(result) {
        alert("Thuộc tính đã được thêm!");
        loadData();
        $("#add-attribute").css("display", "none");
        $("#main_index").css("filter", "none");
    }).fail(function(error) {
        console.error("Error adding attribute:", error);
    });
});


function deleteAttribute(id, type) {
    if (confirm("Bạn có chắc chắn muốn xóa?")) {
        $.ajax({
            method: "DELETE",
            url: `http://localhost:8080/delete-attribute?type=${type}&id=${id}`,
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("Token"),
            },
            success: function () {
                alert("Xóa thành công!");
                loadData();
            },
            error: function (err) {
                console.error("Lỗi khi xóa:", err);
                alert("Xóa thất bại!");
            },
        });
    }
}
function editAttribute(id, type) {
    const newValue = prompt("Nhập giá trị mới:");
    if (newValue) {
        $.ajax({
            method: "PUT",
            url: `http://localhost:8080/edit-attribute?type=${type}&id=${id}`,
            data: JSON.stringify({ name: newValue }),
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("Token"),
            },
            success: function () {
                alert("Cập nhật thành công!");
                loadData();
            },
            error: function (err) {
                console.error("Lỗi khi cập nhật:", err);
                alert("Cập nhật thất bại!");
            },
        });
    }
}
