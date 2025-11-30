$(document).ready(function() {
    // Lắng nghe sự kiện thay đổi giá trị của input quantity
    $(document).on('input', 'input[name="quantity"]', function() {
        // Lấy giá trị mới của quantity
        var quantity = $(this).val();
        
        // Lấy giá của sản phẩm từ data-price
        var price = $(this).closest('tr').find('.total-price .secondary-font').data('price');
        
        // Tính lại total-price
        var totalPrice = quantity * price;
        
        // Cập nhật giá trị total-price
        var productId = $(this).attr('id').split('-')[1];  // Lấy id sản phẩm từ id của input quantity (ví dụ quantity-123)
        $('#total-price-' + productId).text("$"+totalPrice);  // Cập nhật giá trị tổng vào span tương ứng
        updateCartTotal();
      });
      
      
    // Lấy token từ localStorage
    const token = localStorage.getItem("token");

    

    // Gọi hàm loadCart khi trang tải xong
    loadCart(token);
    $('#update-cart-btn').click(function() {
        updateCart(token);
    });
    // Cập nhật giỏ hàng khi thay đổi số lượng
    $('.quantity-left-minus, .quantity-right-plus').click(function() {
      let $input = $(this).closest('tr').find('.input-number');
      let quantity = parseInt($input.val());
      
      if ($(this).hasClass('quantity-left-minus') && quantity > 1) {
        quantity--;
      } else if ($(this).hasClass('quantity-right-plus')) {
        quantity++;
      }
      
      $input.val(quantity);
    });
  });
  function updateCartTotal() {
    var subtotal = 0;
    // Lấy tất cả các giá trị total-price của sản phẩm trong giỏ hàng và cộng lại
    $('#cart-table tbody .total-price .secondary-font').each(function() {
        var productTotal = parseFloat($(this).text().replace('$', '').replace(',', '').trim());
        subtotal += productTotal;
    });
    const subtotalElement = document.querySelector('.price-amount.subtotal');
    subtotalElement.textContent = "$"+subtotal;
    const totalElement = document.querySelector('.price-amount.total');
    totalElement.textContent = "$"+subtotal;
}
// Hàm loadCart để tải giỏ hàng
function loadCart(token) {
    $.ajax({
        url: "http://localhost:8080/cart-user",
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        success: function(data) {
            const cart = $('#cart-table tbody');
            cart.empty();  // Xóa hết nội dung trong tbody trước khi thêm mới
            const subtotalElement = document.querySelector('.price-amount.subtotal');
            subtotalElement.textContent = `$${data.data.total}`;
            const totalElement = document.querySelector('.price-amount.total');
            totalElement.textContent = `$${data.data.total}`;
            // Kiểm tra xem data có phải là mảng hay không
            if (Array.isArray(data.data.product)) {
                // Duyệt qua từng sản phẩm trong giỏ hàng
                data.data.product.forEach((product) => {
                    // Xây dựng mã HTML cho mỗi sản phẩm
                    const listItem = `
                        <tr>
                            <td scope="row" class="py-4">
                                <div class="cart-info d-flex flex-wrap align-items-center ">
                                    <div class="col-lg-3">
                                        <div class="card-image">
                                            <img src="images/item1.jpg" alt="cloth" class="img-fluid">
                                        </div>
                                    </div>
                                    <div class="col-lg-9">
                                        <div class="card-detail ps-3">
                                            <h5 class="card-title">
                                                <a href="./single-product.html?id=${product.ID_product._id}" class="text-decoration-none">${product.ID_product.product_name}</a>
                                            </h5>
                                            <small>Color: ${product.color_name}, Size: ${product.size_name} </small>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td class="py-4 align-middle">
                                <div class="input-group product-qty align-items-center w-50">
                                    <input type="number" id="quantity-${product._id}" name="quantity"
                                        class="form-control input-number text-center p-2 mx-1" value="${product.quantity}">
                                </div>
                            </td>
                            <td class="py-4 align-middle">
                                <div class="price">
                                      <span class="secondary-font fw-medium" id="price-${product._id}" data-price="${product.price}">$${product.price}</span>
                                </div>
                            </td>
                            <td class="py-4 align-middle">
                                <div class="total-price">
                                      <span class="secondary-font fw-medium" id="total-price-${product._id}" data-price="${product.price}">$${product.price * product.quantity}</span>
                                </div>
                            </td>
                            <td class="py-4 align-middle">
                                <div class="cart-remove">
                                    <a href="#">
                                        <svg width="24" height="24">
                                            <use xlink:href="#trash"></use>
                                        </svg>
                                    </a>
                                </div>
                            </td>
                        </tr>
                    `;
                    cart.append(listItem);
                });
            } else {
                console.error("data.data.product không phải là mảng:", data.data.product);
            }
        },
        error: function() {
            alert('Không thể tải giỏ hàng.');
        }
    });
}
function updateCart(token) {
    const quantityInputs = document.querySelectorAll('input[id^="quantity-"]');
    const products = [];

    quantityInputs.forEach(input => {
        const productId = input.id.split('-')[1]; // Lấy _id từ id của input
        const quantity = parseInt(input.value); // Lấy số lượng

        if (productId && quantity) {
            products.push({
                _id: productId,
                quantity: quantity,
            });
        }
    });
    const product = JSON.stringify(products);
    console.log(product);

    // Nếu không có sản phẩm nào trong giỏ
    if (products.length === 0) {
        console.error("Không có sản phẩm nào để cập nhật.");
        return;
    }

    // Gửi yêu cầu lên API
    $.ajax({
        url: "http://localhost:8080/up-cart",
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        data: product,
        success: function(data) {
            console.log("Cập nhật thành công:", data);
            loadCart(token);
        },
        error: function(error) {
            console.error("Lỗi khi cập nhật giỏ hàng:", error);
            alert("Có lỗi xảy ra khi cập nhật giỏ hàng!");
        }
    });    
}
