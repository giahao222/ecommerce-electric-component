$(document).ready(function () {
    // Kiểm tra khi click vào edit_product
    $(document).on("click", ".edit_product", function () {
      console.log("Edit Product clicked");
      var productId = $(this).data("product-id"); // Lấy ID sản phẩm từ data attribute
      console.log("Product ID:", productId); // In ID sản phẩm ra console
  
      // Hiển thị form chỉnh sửa
      $("#main_index").css("filter", "blur(5px)");
      $("#table_edit").css("display", "flex");
      // Gọi hàm fetchProductData để lấy dữ liệu sản phẩm
      fetchProductData(productId);
      Edit_Button(productId);
    });
  
    // Đóng popup khi nhấn nút Cancel
    $("#closePopup").click(function () {
      $("#table_edit").css("display", "none");
      $("#main_index").css("filter", "none");
    });
  });
  $(document).on("click", ".add_product", function () {
    console.log("Add Product clicked");
    // Hiển thị form chỉnh sửa
    $("#main_index").css("filter", "blur(5px)");
    $("#table_add").css("display", "flex");
  });

  // Đóng popup khi nhấn nút Cancel
  $("#closeAdd").click(function () {
    $("#table_add").css("display", "none");
    $("#main_index").css("filter", "none");
  });
  // Hàm riêng để gọi API và điền dữ liệu vào form
  function fetchProductData(productId) {
    $.ajax({
      method: "GET",
      url: `http://localhost:8080/product?id=${productId}`,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("Token"),
      },
      success: function (result) {
        console.log("Success response received");
        
        if (result.data && result.data.product) {
          const product = result.data.product;
          const productDetail = result.data.product_details;
          console.log(productDetail);
          // Điền dữ liệu vào form
          $(".input-product-name").val(product.product_name);
          $(".input-rate").val(product.star);
          $(".input-description").val(product.description);
          $(".input-information").val(product.information);
          $(".input-price").val(product.price_new);
          $(".input-old-price").val(product.price_old);
          $(".input-quantity").val(productDetail ? productDetail.quantity : 0);
          $(".input-sku").val(product.sku);  
          // Hàm kiểm tra và tích checkbox cho thuộc tính
          function checkSelectedAttributes(attributeIds, containerClass) {
            if (Array.isArray(attributeIds)) {
              attributeIds.forEach((attribute) => {
                const checkbox = $(`.${containerClass} input[value="${attribute._id}"]`);
                if (checkbox.length) {
                  checkbox.prop("checked", true); // Đánh dấu tích
                }
              });
            } else {
              console.error(`Invalid format for ${containerClass}:`, attributeIds);
            }
          }
  
          // Tích checkbox cho Categories
          if (productDetail && productDetail.ID_category) {
            checkSelectedAttributes(productDetail.ID_category, "checkbox-category-container");
          }
  
          // Tích checkbox cho Colors
          if (productDetail && productDetail.ID_color) {
            checkSelectedAttributes(productDetail.ID_color, "checkbox-color-container");
          }
  
          // Tích checkbox cho Sizes
          if (productDetail && productDetail.ID_size) {
            checkSelectedAttributes(productDetail.ID_size, "checkbox-size-container");
          }
  
          // Tích checkbox cho Tags
          if (productDetail && productDetail.ID_tag) {
            checkSelectedAttributes(productDetail.ID_tag, "checkbox-tag-container");
          }
  
          // Cập nhật hình ảnh (nếu có)
          if (product.image) {
            $(".cr-image-preview").attr("src", product.image.split(",")[0] || "./assets_admin/img/product/preview-2.jpg");
          }
  
          // Nếu có hình ảnh thumb
          if (productDetail && productDetail.ID_colors && productDetail.ID_colors.length > 0) {
            $(".image-thumb-preview").attr("src", productDetail.ID_colors[0].image || "./assets_admin/img/product/preview-2.jpg");
          }
        } else {
          console.error("Product data not found");
        }
      },
      error: function (error) {
        console.error("Failed to fetch product data:", error);
      }
    });
  }
  function Edit_Button(productId) {
    $(".edit-producted").submit(function (e) {
      e.preventDefault(); // Ngăn chặn form gửi lại trang
      // Lấy dữ liệu từ các input trong form
      const productName = $(".input-product-name").val();
      const description = $(".input-description").val();
      const information = $(".input-information").val();
      const price = $(".input-price").val();
      const oldPrice = $(".input-old-price").val();
      const quantity = $(".input-quantity").val();
      const sku = $(".input-sku").val();
      const star = $(".input-rate").val();
      
      // Lấy danh sách các checkbox đã chọn
      const selectedCategories = [];
      $(".checkbox-category-container input:checked").each(function() {
        selectedCategories.push($(this).val());
      });
      const selectedTags = [];
      $(".checkbox-tag-container input:checked").each(function() {
        selectedTags.push($(this).val());
      });
    
      const selectedSizes = [];
      $(".checkbox-size-container input:checked").each(function() {
        selectedSizes.push($(this).val());
      });
    
      const selectedColors = [];
      $(".checkbox-color-container input:checked").each(function() {
        selectedColors.push($(this).val());
      });
      
      // Tạo đối tượng FormData nếu có hình ảnh
      const formData = new FormData();
      formData.append("product_name", productName);
      formData.append("price_new", price);
      formData.append("price_old", oldPrice);
      formData.append("description", description);
      formData.append("information", information);
      formData.append("sku", sku);
      formData.append("star", star);
      formData.append("quantity", quantity);
      formData.append("category", JSON.stringify(selectedCategories));
      formData.append("tag", JSON.stringify(selectedTags));
      formData.append("sizes", JSON.stringify(selectedSizes));
      formData.append("colors", JSON.stringify(selectedColors));
    
    
      // Gửi dữ liệu lên server bằng AJAX
      $.ajax({
        method: "PUT", // Dùng PUT để cập nhật
        url: `http://localhost:8080/edit-product?id=${productId}`, // Đường dẫn API của bạn
        headers: {
          "Authorization": "Bearer " + localStorage.getItem("Token"),
        },
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
          console.log("Product updated successfully", response);
          
          loadData();
          $("#table_edit").css("display", "none");
          $("#main_index").css("filter", "none");
        },
        error: function (error) {
          console.error("Error updating product", error);
          // Handle error (thông báo lỗi cho người dùng)
        }
      });
    });
  }
  $(".add-producted").submit(function (e) {
    e.preventDefault(); // Ngăn chặn form gửi lại trang
    // Lấy dữ liệu từ các input trong form
    // Lấy danh sách các checkbox đã chọn
    const selectedCategories = [];
    $(".checkbox-category-container input:checked").each(function() {
      selectedCategories.push($(this).val());
    });
    const selectedTags = [];
    $(".checkbox-tag-container input:checked").each(function() {
      selectedTags.push($(this).val());
    });
  
    const selectedSizes = [];
    $(".checkbox-size-container input:checked").each(function() {
      selectedSizes.push($(this).val());
    });
  
    const selectedColors = [];
    $(".checkbox-color-container input:checked").each(function() {
      selectedColors.push($(this).val());
    });
    const productName = $(".add-product-name").val();
    const description = $(".add-description").val();
    const information = $(".add-information").val();
    const price = $(".add-price").val();
    const oldPrice = $(".add-old-price").val();
    const quantity = $(".add-quantity").val();
    const sku = $(".add-sku").val();
    // Tạo đối tượng FormData nếu có hình ảnh
    const formData = new FormData();
    formData.append("product_name", productName);
    formData.append("price_new", price);
    formData.append("price_old", oldPrice);
    formData.append("description", description);
    formData.append("information", information);
    formData.append("sku", sku);
    formData.append("quantity", quantity);
    formData.append("category", selectedCategories);
    formData.append("tag", selectedTags);
    formData.append("sizes", selectedSizes);
    formData.append("colors", selectedColors);
  
    // Gửi dữ liệu lên server bằng AJAX
    $.ajax({
      method: "POST",
      url: `http://localhost:8080/add-product`, // Đường dẫn API của bạn
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("Token"),
      },
      data: formData,
      processData: false,
      contentType: false,
      success: function (response) {
        alert("Sản phẩm đã được thêm thành công!");
        console.log("Product added successfully", response);
      },
      error: function (error) {
        alert("Lỗi khi thêm sản phẩm, vui lòng thử lại!");
        console.error("Error updating product", error);
      },
    });
  });
  function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product?')) {
      fetch(`http://localhost:8080/delete-product?id=${productId}`, {
        method: 'DELETE',  // Use DELETE method for deletion
      })
      .then(response => response.json())
      .then(data => {
        if (data.message === "Xóa sản phẩm thành công") {
          alert('Product deleted successfully');
          location.reload();  // Reload the page to update the list
        } else {
          alert(data.message || 'Error deleting product');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error deleting product');
      });
    }
  }
  