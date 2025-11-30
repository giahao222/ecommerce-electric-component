// $(document).ready(function () {
//   loadCategory();
//   $(".add-producted").submit(function (e) {
//     e.preventDefault();
//     var fileInput1 = document.getElementById("product_main");
//     var selectedFile1 = fileInput1.files[0];

//     var fileInput2 = document.getElementById("thumbUpload01");
//     var selectedFile2 = fileInput2.files[0];

//     // Lấy phần tử select
//     var selectElement = document.querySelector(".select-category");

//     // Lấy option được chọn
//     var selectedOption = selectElement.options[selectElement.selectedIndex];

//     // Lấy giá trị category-name từ option được chọn
//     var categoryName = selectedOption.getAttribute("category-name");

//     var product_name = $(".input-product-name").val();
//     var description = $(".input-description").val();
//     var price = $(".input-price").val();
//     var old_price = $(".input-old-price").val();
//     var rate = "0";
//     var quantity = $(".input-quantity").val() || "1";

//     var fileList = [selectedFile1, selectedFile2];
//     console.log(fileList);
//     console.log("categoryName:", categoryName);
//     console.log("product_name:", product_name);
//     console.log("description:", description);
//     console.log("price:", price);
//     console.log("old_price:", old_price);
//     console.log("rate:", rate);
//     console.log("quantity:", quantity);

//     // Tạo đối tượng FormData
//     const formData = new FormData();
//     const newProductData = {
//       price: price,
//       old_price: old_price,
//       description: description,
//       productName: product_name,
//       quantity: quantity,
//       name_category: categoryName,
//       rate: 0,
//     };
//     formData.append(
//       "data",
//       new Blob([JSON.stringify(newProductData)], { type: "application/json" })
//     );

//     fileList.forEach((item) => {
//       formData.append("file", item);
//     });
    
//     console.log(fileList);

//     axios
//       .post("http://localhost:8080/product", formData, {
//         headers: {
//           "content-type": "multipart/form-data",
//           authorization: `Bearer ${localStorage.getItem("Token")}`,
//         },
//         timeout: 5000,
//       })
//       .then((result) => {
//         if (!result) {
//           alert("Lỗi");

//         } else {
//           alert("Thêm dữ liệu thành công");
//           location.reload();
//         }
//       })
//       .catch((err) => {
//         console.log(err);
//       });
//   });
// });

// function loadCategory() {
//   $.ajax({
//     method: "GET",
//     url: "http://localhost:8080/category",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: "Bearer " + localStorage.getItem("Token"),
//     },
//   })
//     .done(function (result) {
//       displayCategory(result.data);
//       console.log(result.data);
//       var data = JSON.stringify(result.data);
//       localStorage.setItem("CateroryList", data);
//       dataLoaded = true;
//     })
//     .fail(function (jqXHR, textStatus, errorThrown) {
//       console.error("AJAX request failed: " + textStatus, errorThrown);
//     });
// }

// function displayCategory(categorys) {
//   var htmlItem = "";
//   for (var i = 0; i < categorys.length; i++) {
//     var category = categorys[i];
//     htmlItem += createcategoryHTML(category);
//   }
//   $(".select-category").append(htmlItem);
// }
// function createcategoryHTML(category) {
//   return ` <option category-name = '${category.name}'> ${category.name}</option>`;
// }
