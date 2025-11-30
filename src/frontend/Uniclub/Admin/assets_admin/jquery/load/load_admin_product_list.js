var dataLoaded = false;
$(document).ready(function () {  
  if (dataLoaded === false) {
      loadData();
  }
});

function loadData() {
  $.ajax({
    method: "GET",
    url: "http://localhost:8080/products",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("Token"),
    },
  })
    .done(function (result) { // Kiểm tra toàn bộ dữ liệu trả về      
      // Kiểm tra cấu trúc dữ liệu và đảm bảo data tồn tại
      if (result.data && Array.isArray(result.data)) {
        displayProducts(result.data); // Truyền đúng mảng `data`
        var data = JSON.stringify(result.data); // Lưu dữ liệu sản phẩm vào LocalStorage
        localStorage.setItem("ProductList", data);
        dataLoaded = true; // Đánh dấu dữ liệu đã được tải
      } else {
        console.error("Invalid data format:", result);
      }
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      console.error("AJAX request failed: " + textStatus, errorThrown);
    });
    $.ajax({
      method: "GET",
      url: "http://localhost:8080/attribute",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("Token"),
      },
    })
      .done(function (result) {
        if (result.data && typeof result.data === "object") {
          displayAttribute(result.data); // Gắn danh mục vào dropdown
        } else {
          console.error("Invalid data format for categories:", result);
        }
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        console.error("Failed to load categories:", textStatus, errorThrown);
      });
}
function displayProducts(data) {
  var htmlItem = "";
  for (var i = 0; i < data.length; i++) {
    var product = data[i].product; // Lấy dữ liệu sản phẩm
    var productDetail = data[i].product_detail; // Lấy chi tiết sản phẩm

    // Kiểm tra nếu sản phẩm có chi tiết
    var productDetailInfo = productDetail ? productDetail : "Chưa có thông tin chi tiết";
    htmlItem += createProductHTML(product, productDetailInfo);
  }
  $("#product_list tbody").empty().append(htmlItem);
}
function createProductHTML(product, productDetailInfo) {
  return `
            <tr>
                <td><img class="tbl-thumb" src="${product.image.split(",")[0] || "./assets_admin/img/product/preview-2.jpg"}"
                      style="height: 80px;"  alt="Product Image"></td>
                <td>${product.product_name}</td>
                <td>${product.price_new}</td>
                <td>${product.price_old}</td>
                <td>${product.star}</td>
                <td><textarea readonly name="" id="" cols="30" rows="3" cols="7">${
                  product.description
                }</textarea></td>
                <td><textarea readonly name="" id="" cols="30" rows="3" cols="7">${
                  product.information
                }</textarea></td>
                <td>${product.sku}</td>
                <td>
                  <a href="#" class="edit_product" data-product-id="${product._id}">Update</a> | 
                  <a href="#" onclick="deleteProduct('${product._id}')">Delete</a>
                </td>
            </tr>`;
}

function displayAttribute(data) {
  if (!data) return;
  console.log(data);
  function renderCheckboxes(data, containerClass, idPrefix, labelKey) {
    const container = $(containerClass); // Chọn container dựa trên class
    container.empty(); // Xóa nội dung cũ
  
    if (data && Array.isArray(data)) {
      data.forEach((item) => {
        const checkboxHTML = `
          <div class="form-check">
            <input 
              class="form-check-input" 
              type="checkbox" 
              id="${idPrefix}-${item._id}" 
              value="${item._id}">
            <label 
              class="form-check-label" 
              for="${idPrefix}-${item._id}">
              ${item[labelKey]}
            </label>
          </div>
        `;
        container.append(checkboxHTML); // Thêm checkbox vào container
      });
    } else {
      console.error(`Data for ${containerClass} is not in the expected format:`, data);
    }
  }
  
  // Gọi hàm render cho từng mục
  if (data.categories) {
    renderCheckboxes(data.categories, ".checkbox-category-container", "category", "name");
  }
  
  if (data.tags) {
    renderCheckboxes(data.tags, ".checkbox-tag-container", "tag", "name");
  }
  
  if (data.sizes) {
    renderCheckboxes(data.sizes, ".checkbox-size-container", "size", "name");
  }
  
  if (data.colors) {
    renderCheckboxes(data.colors, ".checkbox-color-container", "color", "name");
  }
  
}
