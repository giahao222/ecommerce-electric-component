const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

// link đăng kí
router.post("/create-account", authController.createAccount);

// link xác thực
router.get("/verify", authController.verify_email);

// đăng nhập bằng tài khoản
router.post("/login-normal", authController.loginByEmailandPassword);

// chuyển hướng sang auth/google
router.get("/google", authController.loginWithGoogle);

// callbackurl
router.get("/auth/google/callback", authController.callBackURL);

// đăng nhập bằng facebook
router.get("/facebook", authController.loginWithFacebook);

// callback url facebook
router.get("/auth/facebook/callback", authController.callBackUrlFaceBook);

// gửi yêu cầu reset password
router.post("/forgot-password", authController.send_mail_forgot_password);

// xác nhật và cập nhật lại mật khẩu
router.post("/reset-password", authController.reset_password);

// đăng xuất
router.get("/logout", authController.logout);
module.exports = router;
