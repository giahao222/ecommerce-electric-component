const jwt = require("jsonwebtoken");
const User = require("../models/users");
const Role = require("../models/roles");
require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

function check_cookie_token(req) {
  const token = req.cookies.token;
  return token || false;
}

const authMiddleware = async (req, res, next) => {
  const cookietoken = check_cookie_token(req);
  const headertoken = req.header("Authorization")?.replace("Bearer ", "");
  
  const token = cookietoken || headertoken;
  console.log(token)
  if (!token) {
    return res.status(401).json({ message: "Không thể xác thực", code: "NO_TOKEN" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findOne({ _id: decoded.user_id || decoded.id });
    console.log(user.full_name)
    if (!user) {
      console.log("a")
      return res.redirect("/login");
    }

    req.user = user;
    next();

  } catch (error) {
    console.error("JWT Error:", error);

    // 🔥 Nếu token hết hạn
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token hết hạn",
        code: "TOKEN_EXPIRED",
        expiredAt: error.expiredAt,
      });
    }

    // 🔥 Token không hợp lệ
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Token không hợp lệ",
        code: "TOKEN_INVALID",
      });
    }
    
    // 🔥 Lỗi khác → vẫn redirect
    return res.redirect("/login");
  }
};

const checkRoleUser = async (req, res, next) => {
  const user = req.user;
  console.log("User details:", user.id_roles);

  try {
    const role = await Role.findById(user.id_roles);
    console.log("Fetched role:", role);

    if (role && role.name === "Admin") {
      next();
    } else {
      res.status(400).json({ message: "Bạn không có quyền truy cập vào link này!" });
    }
  } catch (error) {
    console.error("Error fetching role:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi kiểm tra quyền!" });
  }
};

module.exports = { authMiddleware, checkRoleUser };
