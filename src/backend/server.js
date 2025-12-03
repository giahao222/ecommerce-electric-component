const path = require("path");
require("dotenv").config({
});
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const rateLimit = require("express-rate-limit");
const cors = require("cors");

const authRouter = require("./src/router/authRouter");
const productRouter = require("./src/router/productRouter");
const userRouter = require("./src/router/userRouter");
const cardRouter = require("./src/router/cartRouter");
const orderRouter = require("./src/router/orderRouter");
const reportRouter = require("./src/router/reportRouter");
const reviewRouter = require("./src/router/reviewRouter");
const connectToDatabase = require("./src/config/dbConfig");
const paymentRoutes = require("./src/router/payment.routes");
// kết nối với google
require("./src/config/googleConfig");
// Kết nối tới database
connectToDatabase();

const app = express();
const port = 8080;

app.set("trust proxy", 1);
app.use(cors());

// // 🔒 rate limit
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: "Bạn đã thực hiện quá nhiều yêu cầu. Vui lòng thử lại sau.",
//   standardHeaders: true,
//   legacyHeaders: false,
// });
// app.use(limiter);

// 🔧 middlewares chung
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// 🔹 STATIC FRONTEND
// Giả sử cấu trúc: src/frontend/UniClub/User/...
const frontendRoot = path.join(__dirname, "../frontend/Uniclub/User");

// serve js, css, img... trong thư mục này
app.use(express.static(path.join(frontendRoot, "Template")));
app.use("/css", express.static(path.join(frontendRoot, "css")));
app.use("/js", express.static(path.join(frontendRoot, "js")));
// app.use("/images", express.static(path.join(frontendRoot, "images")));
app.use("/images", express.static(path.join(__dirname, "public/images")));

app.use(express.static(frontendRoot));

// 🔹 ROUTE TRANG HOME
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendRoot, "Template", "home.html"));
});
app.get("/home", (req, res) => {
  res.sendFile(path.join(frontendRoot, "Template", "home.html"));
});
app.get("/login", (req, res) => {
  res.sendFile(path.join(frontendRoot, "Template", "login.html"));
});
app.get("/forgot-password", (req, res) => {
  res.sendFile(path.join(frontendRoot, "Template", "forgot-password.html"));
});
app.get("/reset-password", (req, res) => {
  res.sendFile(path.join(frontendRoot, "Template", "reset-password.html"));
});
app.get("/create-account", (req, res) => {
  res.sendFile(path.join(frontendRoot, "Template", "create-account.html"));
});
// 🔹 ROUTE TRANG CATEGORY (dùng 1 file category.html cho mọi slug)
app.get("/category/:slug", (req, res) => {
  res.sendFile(path.join(frontendRoot, "Template", "category.html"));
});


app.use('/payment', paymentRoutes);


// 🔹 ROUTE TRANG CATEGORY (dùng 1 file category.html cho mọi slug)
app.get("/category/:slug", (req, res) => {
  res.sendFile(path.join(frontendRoot, "Template", "category.html"));
});


// Trang chi tiết product
app.get("/product/:slug", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../frontend/UniClub/User/Template/product_detail.html")
  );
});

app.use(
  '/prepared-clam.10web.cloud',
  express.static(path.join(__dirname, '..', '..', 'vendors', 'prepared-clam.10web.cloud'))
);

// 🔹 API ROUTES
app.use(authRouter);
app.use(productRouter);
app.use(cardRouter);
app.use(orderRouter);
app.use(reportRouter);
app.use(reviewRouter);
app.use(userRouter);

// Khởi chạy server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
