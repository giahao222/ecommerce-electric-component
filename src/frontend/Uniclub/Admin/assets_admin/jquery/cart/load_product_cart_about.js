var dataLoaded = false;
// const
$(document).ready(function () {
  if (!dataLoaded) {
    cartList();
  }
});

function cartList() {
  var dataCart = localStorage.getItem("cart");
  var data = JSON.parse(dataCart);
  var htmlListCart = "";

  var count = 0;
  if (data) {
    for (var i = 0; i < data.length; i++) {
      count += data[i].soluong * data[i].price;
      htmlListCart += `<div class="single-cart-item">
                            <div class="cart-img">
                                <a><img src="${data[i].images.split(",")[0]}"
                                        alt="" height="50" wight="30"></a>
                            </div>
                            <div class="cart-text">
                                <h5 class="title"><a>${data[i].name}</a></h5>
                                <div class="cart-text-btn">
                                    <div class="cart-qty">
                                        <span>${data[i].soluong}×</span>
                                        <span class="cart-price">$${
                                          data[i].price
                                        }</span>
                                    </div>
                                    <button type="button"><i
                                            class="ion-trash-b"></i></button>
                                </div>
                            </div>
                        </div>`;
    }
  }
  var htmlInsert = ` <div class="cart-price-total d-flex justify-content-between">
                      <h5>Total :</h5>
                      <h5>$${count}</h5>
                      </div>
                      <div class="cart-links d-flex justify-content-center">
                      <a class="obrien-button white-btn" href="cart.html">View
                          cart</a>
                      <a class="obrien-button white-btn"
                          href="checkout.html">Checkout</a>
                    </div>`;
  console.log(data.length);

  $(".list-cart").append(htmlListCart, htmlInsert);
  $(".cart-item_count").text(data.length);
}
