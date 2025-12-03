const Order = require("../models/orders");
const OrderDetail = require("../models/orderdetails");
const Card = require("../models/cards");
const Product = require("../models/products");
const Payment = require("../models/payment");
const PayOS = require("@payos/node");
const Cart = require("../models/cards");
const payos = new PayOS(
  "31c121c9-7e94-4ee9-9794-03bfbb054b76",
  "8bb1d166-8901-42e8-9136-1df9ce7f6ea4",
  "3ab8e528f265d2fdb50202a61500296bd2c2fb8d6fa4032e423559384b3bf5f6"
);

// Generate a unique `orderCode`
async function generateUniqueOrderCode() {
  let orderCode;
  let isUnique = false;

  while (!isUnique) {
    orderCode = Math.floor(1000 + Math.random() * 9000); // 4-digit random code
    const existingOrder = await Order.findOne({ orderCode });
    if (!existingOrder) isUnique = true;
  }
  return orderCode;
}

// Xác nhận thanht toán
const confilm_pay = async (req, res) => {
  const user_id = req.user._id;
  const data_orders = req.body;

  const card = await Card.findOne({ id_user: user_id });
  const payment = await Payment.findOne({name:data_orders.payment_name});

  const orderCode = await generateUniqueOrderCode();

  const order_user_save = new Order({
    name: data_orders.name,
    phone: data_orders.phone,
    address: data_orders.address,
    email_address: data_orders.email_address,
    payment_method_id: payment._id,
    note: data_orders.note,
    status: "pending",
    total: data_orders.total,
    id_user: user_id,
    orderCode: orderCode,
  });

  // Copy products from card to orderProducts
  const orderProducts = [...card.products];

  await order_user_save.save();

  const orderDetail = new OrderDetail({
    order_id: order_user_save._id,
    products: orderProducts,
  });
  await orderDetail.save();

  // Clear the products array in the Card model and save
  card.products = [];
  card.total = 0;
  await card.save();

  const order = {
    amount: order_user_save.total,
    description: "Thanh toan don hang",
    orderCode: orderCode,
    returnUrl: `http://127.0.0.1:5500/fontend/Uniclub/User/home.html?success=${true}`, // link phải trả về khi đã thanh toán thành công
    cancelUrl: `http://127.0.0.1:5500/fontend/Uniclub/User/home.html?cancel=${true}`, // link trả về khi chúng ta hủy thanh toán
  };

  try {
    const paymentLink = await payos.createPaymentLink(order);
    res.status(200).json({
      redirectUrl: paymentLink.checkoutUrl,
    });
  } catch (error) {
    console.error("Error creating payment link:", error);
    res.status(500).send("An error occurred while creating the payment link.");
  }
};

// Webhook sẽ cập nhật lại trạng thái thanh toán khi đã hoàn thành bước chuyển khoản
const receive_hook = async (req, res) => {
  const { orderCode } = req.body.data;
  const { desc } = req.body;
  console.log(req.body);

  try {
    if (desc === "Thành công" || desc.toLowerCase() === "success") {
      const order = await Order.findOneAndUpdate(
        { orderCode },
        { status: "handle" },
        { new: true }
      );
      if (order) {
        console.log(
          "Order status updated to 'handle' for orderCode:",
          orderCode
        );
      } else {
        console.log("Order not found for orderCode:", orderCode);
      }
    }
    res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({ message: "Error processing webhook" });
  }
};

const get_all_history_transaction_order_all_user = async (req, res) => {
  try {
    const orderHistoryTransaction = await Order.find();
    if (!orderHistoryTransaction) {
      return res
        .status(404)
        .json({ message: "Order History Transaction not found" });
    }
    return res.status(200).json({
      message: "Lấy dữ liệu thành công",
      data: orderHistoryTransaction,
    });
  } catch (error) {
    console.error("Error get all history transaction order:", error);
    return res.status(500).json({
      message: "Error get all history transaction order",
    });
  }
};

function OrderBaseReponse(data, productData) {
  return {
    orderCode: data.orderCode,
    date_order: data.createdAt,
    status: data.status,
    total: data.total,
    payment_method: "Chuyển khoản",
    information_user_receive: {
      name: data.name,
      phone: data.phone,
      address: data.address,
    },
    products: productData,
  };
}

const get_order_for_user = async (req, res) => {
  try {
    const user_id = req.user._id;
    const { order_id } = req.body;
    const orderUser = await Order.findOne({
      _id: order_id,
    });

    if (!orderUser) {
      return res.status(400).json({
        message: "Order not found for user",
      });
    }

    const orderDetailUser = await OrderDetail.findOne({
      order_id: orderUser._id,
    });

    if (!orderDetailUser || orderDetailUser.length === 0) {
      return res.status(400).json({
        message: "Order details not found for user",
      });
    }

    const dataOrderUser = OrderBaseReponse(orderUser, orderDetailUser.products);

    return res.status(200).json({
      message: "Success",
      data: dataOrderUser,
    });
  } catch (error) {
    console.error("Error getting order for user:", error);
    return res.status(500).json({
      message: "Error getting order for user",
    });
  }
};
function randomOrderCode() {
  return Math.floor(100000 + Math.random() * 900000);
}

const createOrder = async (req, res) => {
  try {
    const user = req.user;
    const { name, address, phone, email_address, note, payment_method_id } = req.body;

    const cart = await Cart.findOne({ id_user: user._id }).populate("products.ID_product");

    if (!cart || cart.products.length === 0)
      return res.status(400).json({ message: "Giỏ hàng trống" });

    // Tính tổng tiền
    let total = 0;
    cart.products.forEach(p => total += p.price * p.quantity);

    // Tạo Order
    const order = await Order.create({
      name,
      address,
      phone,
      email_address,
      note,
      payment_method_id,
      status: "draft",
      total,
      id_user: user._id,
      orderCode: randomOrderCode(),
    });

    // Tạo OrderDetail
    await OrderDetail.create({
      order_id: order._id,
      products: cart.products.map(p => ({
        ID_product: p.ID_product._id,
        price: p.price,
        size_name: p.size_name,
        color_name: p.color_name,
        quantity: p.quantity,
      })),
    });


    return res.json({
      message: "Tạo đơn hàng thành công",
      order_id: order._id,
      orderCode: order.orderCode,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

module.exports = {
  confilm_pay,
  receive_hook,
  get_all_history_transaction_order_all_user,
  get_order_for_user,
  createOrder
};
