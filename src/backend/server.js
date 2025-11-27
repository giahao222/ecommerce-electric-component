require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const authRouter = require("./src/router/authRouter");
const rateLimit = require("express-rate-limit");
const productRouter = require("./src/router/productRouter");
const userRouter = require("./src/router/userRouter");
const cardRouter = require("./src/router/cartRouter");
const orderRouter = require("./src/router/orderRouter");
const reportRouter = require("./src/router/reportRouter");
const reviewRouter = require("./src/router/reviewRouter");
const cors = require('cors');
const connectToDatabase = require("./src/config/dbConfig");
// kết nối với google
require("./src/config/googleConfig");
// Kết nối tới database
connectToDatabase();

const app = express();
app.use(cors());
const port = 8080;
app.set("trust proxy", 1);
// Thiết lập rate limiter với giới hạn nhất định
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Bạn đã thực hiện quá nhiều yêu cầu. Vui lòng thử lại sau.",
  standardHeaders: true,
  legacyHeaders: false, // Tắt header `X-RateLimit-*`
});
app.use(limiter);
app.use(express.static("./src/controller"));

// Thiết lập session với secret từ .env
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(passport.session());
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
