var dataLoaded = false;

$(document).ready(function () {
  if (!dataLoaded) {
    createCartTable();
    check_discount_code();
  }
  handleCartButtonClickDelete();
  dec_qtybutton();
  inc_qtybutton();
});

function createCartTable() {
  var htmlTableCart = "";
  const dataCartList = localStorage.getItem("cart");
  if (dataCartList) {
    const cartData = JSON.parse(dataCartList);

    cartData.forEach((item) => {
      htmlTableCart += createCartHtml(item);
    });
  }
  $(".table-bordered tbody").append(htmlTableCart);
  dataLoaded = true;
  totol_price();
}
function createCartHtml(item) {
  return `<tr>
                  <td class="pro-thumbnail"><a href="#"><img class="img-fluid"
                              src="${
                                item.images.split(",")[0]
                              }" alt="Product"/></a>
                  </td>
                  <td class="pro-title"><a href="#">${item.name}</a></td>
                  <td class="pro-price"><span>$${item.price}.00</span></td>
                  <td class="pro-quantity">
                      <div class="quantity">
                          <div class="cart-plus-minus">
                              <input class="cart-plus-minus-box" value="${
                                item.soluong
                              }" type="text">
                              <div class="dec qtybutton">-</div>
                              <div class="inc qtybutton">+</div>
                              <div class="dec qtybutton"><i class="fa fa-minus"></i></div>
                              <div class="inc qtybutton"><i class="fa fa-plus"></i></div>
                          </div>
                      </div>
                  </td>
                  <td class="pro-subtotal"><span>$${
                    item.price * item.soluong
                  }.00</span></td>
                  <td class="pro-remove"><a href="#"><i class="ion-trash-b" data-product-id='${JSON.stringify(
                    item
                  )}'></i></a></td>
              </tr>`;
}

function handleCartButtonClickDelete() {
  var carts = [];
  var dataCart = localStorage.getItem("cart");
  if (dataCart) {
    carts = JSON.parse(dataCart);
  }
  $("body").on("click", ".ion-trash-b", function () {
    var data = $(this).attr("data-product-id");

    var datapasre = JSON.parse(data);
    console.log(datapasre);
    var newCarts = [];
    for (var i = 0; i < carts.length; i++) {
      if (datapasre.id !== carts[i].id) {
        newCarts.push(carts[i]);
      }
    }
    var dataJsonCart = JSON.stringify(newCarts);
    localStorage.setItem("cart", dataJsonCart);
    reloadCartTable();
  });
}
function reloadCartTable() {
  $(".table-bordered tbody").html("");
  createCartTable();
}
function dec_qtybutton() {
  $(".dec.qtybutton").on("click", function () {
    const productId = $(this).closest("td").data("product-id");
    const product = cartData.find((p) => p.id === productId);
    product.soluong--;
    if (product.soluong < 1) {
      $(this).closest("tr").remove();
    } else {
      $(this).next().val(product.soluong);
      $(this)
        .closest("td")
        .find("span")
        .text("$" + product.price * product.soluong + ".00");
      saveCartToLocalStorage();
    }
  });
}

function inc_qtybutton() {
  $(".inc.qtybutton").on("click", function () {
    const productId = $(this).closest("td").data("product-id");
    const product = cartData.find((p) => p.id === productId);
    product.soluong++;
    $(this).prev().val(product.soluong);
    $(this)
      .closest("td")
      .find("span")
      .text("$" + product.price * product.soluong + ".00");
    saveCartToLocalStorage();
  });
}

function saveCartToLocalStorage() {
  localStorage.setItem("cart", JSON.stringify(cartData));
}

function check_discount_code() {
  $(".form-apply-discount").submit(function (e) {
    e.preventDefault();
    var code = $(".discountCode").val();

    $.ajax({
      method: "GET",
      url: "http://localhost:8080/discount/" + code + "/" + total_price,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("Token"),
      },
    }).done(function (result) {
      $(".total-amount").text("$"+ result.data);
      $(".discount-code").text(100 - (result.data * 100) / total_price + "%");
    });
  });
}

var total_price = 0;
function totol_price() {
  $(".total-price").text("");
  var cart = localStorage.getItem("cart");
  var dataCart = JSON.parse(cart);
  var count = 0;
  for (var i = 0; i < dataCart.length; i++) {
    count += dataCart[i].soluong * dataCart[i].price;
  }
  total_price = count;
  $(".total-price").text("$" + count);
  $(".total-amount").text("$" + count);
}
