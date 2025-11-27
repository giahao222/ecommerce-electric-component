const Order = require("../models/orders");
const OrderDetail = require("../models/orderdetails");
const User = require("../models/users");
const Product = require("../models/products");
const ProductDetails = require("../models/productdetails")
// Helper function to get date ranges
function getDateRange(timeline) {
  const now = new Date();
  let startDate, endDate;

  switch (timeline) {
    case "today":
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
      break;
    case "yesterday":
      startDate = new Date(now.setDate(now.getDate() - 1));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now.setHours(23, 59, 59, 999));
      break;
    case "7days":
      startDate = new Date(now.setDate(now.getDate() - 7));
      endDate = new Date();
      break;
    case "month":
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      break;
    default:
      throw new Error("Invalid timeline");
  }

  return { startDate, endDate };
}

// Total number of orders for a given timeline
async function countOrdersForCustomer(timeline) {
  const { startDate, endDate } = getDateRange(timeline);
  return await Order.countDocuments({
    createdAt: { $gte: startDate, $lte: endDate },
  });
}

// Total quantity of products purchased within a timeline
async function sum_order_product(timeline) {
  const { startDate, endDate } = getDateRange(timeline);
  const orders = await OrderDetail.find({
    createdAt: { $gte: startDate, $lte: endDate },
  });

  return orders.reduce((sum, orderDetail) => {
    const productQuantity = orderDetail.products.reduce(
      (productSum, product) => productSum + product.quantity,
      0
    );
    return sum + productQuantity;
  }, 0);
}

// Total income within a given timeline
async function sum_order_income(timeline) {
  const { startDate, endDate } = getDateRange(timeline);
  const orders = await Order.find({
    createdAt: { $gte: startDate, $lte: endDate },
  });

  return orders.reduce((sum, order) => sum + order.total, 0);
}

//
const report = async (req, res) => {
  const { timeline } = req.query; // ?timeline=today
  if (!timeline) {
    return res.status(400).json({ message: "Please specify a timeline" });
  }

  try {
    const totalOrders = await countOrdersForCustomer(timeline);
    const totalProduct = await sum_order_product(timeline);
    const totalBill = await sum_order_income(timeline);

    res.json({
      totalOrders,
      totalProduct,
      totalBill,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getQuarterlyReport = async (req, res) => {
  try {
    // Define date range for the last quarter (3 months)
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const year = now.getFullYear();
    const startMonth =
      currentMonth - 2 <= 0 ? 12 + (currentMonth - 2) : currentMonth - 2;
    const startYear = startMonth > currentMonth ? year - 1 : year;

    const startDate = new Date(startYear, startMonth - 1, 1);
    const endDate = new Date(year, currentMonth, 0);

    // Query orders within the last quarter
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // Calculate metrics
    const totalIncome = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;

    // Fetch OrderDetails for each order and calculate total products
    const orderDetails = await OrderDetail.find({
      order_id: { $in: orders.map((order) => order._id) },
    });

    const totalProducts = orderDetails.reduce(
      (sum, orderDetail) =>
        sum +
        orderDetail.products.reduce(
          (productSum, product) => productSum + product.quantity,
          0
        ),
      0
    );

    res.json({
      message: "Quarterly report generated successfully",
      totalIncome,
      totalOrders,
      totalProducts,
    });
  } catch (error) {
    console.error("Error generating quarterly report:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

async function get_customer() {
  const customer = await User.find();
  return customer.length;
}

async function get_order() {
  const order = await Order.find();
  return order.length;
}

async function Revenue() {
  const revenue = await Order.find().then((orders) => {
    return orders
      .filter((order) => order.status === "handle") // Lọc các orders có status là 'handle'
      .reduce((sum, order) => sum + order.total, 0); // Tính tổng total
  });
  return revenue;
}
async function Expenses() {
  const products = await Product.find(); // Lấy danh sách các sản phẩm
  const productDetails = await ProductDetails.find(); // Lấy chi tiết sản phẩm

  const expense = products.reduce((sum, product) => {
    const detail = productDetails.find(
      (detail) => detail.ID_product.toString() === product._id.toString()
    ); // Tìm ProductDetails tương ứng
    const quantity = detail?.quantity || 0; // Lấy quantity nếu tồn tại
    return sum + product.price_new * quantity;
  }, 0);

  return expense;
}

const information_report = async (req, res) => {
  const customer = await get_customer();
  const order = await get_order();
  const revenue = await Revenue();
  const expenses = await Expenses();
  res.json({
    message: "Information report generated successfully",
    information: {
      customer,
      order,
      revenue,
      expenses,
    },
  });
};
module.exports = {
  report,
  getQuarterlyReport,
  information_report,
};
