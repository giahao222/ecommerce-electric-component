// document.addEventListener("DOMContentLoaded", function () {
//     const token = localStorage.getItem("token");
//   fetch("http://localhost:8080/users", {
//     method: "GET",
//     headers: {
//       Authorization: "Bearer " + token,
//     },
//   })
//     .then((response) => response.json())
//     .then((data) => {
//       console.log(data.users);
//       // updateUsersList(data.users);
//     })
//     .catch((error) => {
//       console.error("Error fetching products:", error);
//     });
// });
// function updateUsersList(product) {
//   if (!product) return;

//   // Giả sử bạn có các phần tử HTML để hiển thị chi tiết sản phẩm
//   const productNameElement = document.getElementById("product-name");
//   const productPriceElement = document.getElementById("product-price");
//   const productStarElement = document.getElementById("product-star");
//   const productDescriptionElement = document.getElementById(
//     "product-description"
//   );
//   const productImageElement = document.getElementById("product-image");
//   const productSkuElement = document.getElementById("product-sku");
//   const productInfElement = document.getElementById("product-Inf");

//   // Cập nhật thông tin sản phẩm vào các phần tử HTML
//   if (productNameElement) {
//     productNameElement.textContent = product.data.product_name;
//   }
// }
