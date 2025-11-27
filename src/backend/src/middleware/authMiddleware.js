const jwt = require("jsonwebtoken");
const User = require("../models/users");
const Role = require("../models/roles");
require("dotenv").config();
const { ObjectId } = require('mongodb');
const JWT_SECRET = process.env.JWT_SECRET;

function check_cookie_token(req) {
  const cookietoken = req.cookies.token;
  if (!cookietoken) return false;
  return cookietoken;
}
const authMiddleware = async (req, res, next) => {
  const cookietoken = check_cookie_token(req);
  const headertoken = req.header("Authorization")?.replace("Bearer ", "") || "";

  let token;
  token = headertoken;
  if (cookietoken) {
    token = cookietoken;
  } else if (headertoken) {
    token = headertoken;
  } else {
    return res.status(401).json({ message: "Không thể xác thực" }); // Hoặc trả về lỗi 401
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Verify with the same secret
    console.log("Decoded token:", decoded);

    const user = await User.findOne({ _id: decoded.user_id || decoded.id});
    if (!user) {
      console.log("User not found. Redirecting to login.");
      return res.redirect("/login");
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in authentication:", error);
    return res.redirect("/login"); // Hoặc trả về lỗi 401
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
      res
        .status(400)
        .json({ message: "Bạn không có quyền truy cập vào link này!" });
    }
  } catch (error) {
    console.error("Error fetching role:", error);
    res.status(500).json({ message: "Có lỗi xảy ra khi kiểm tra quyền!" });
  }
};

module.exports = { authMiddleware, checkRoleUser };
