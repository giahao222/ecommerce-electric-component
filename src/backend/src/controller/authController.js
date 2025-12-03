require("dotenv").config();
const Role = require("../models/roles");
const User = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const passportFaceBook = require("../config/facebookConfig");
const PasswordResetToken = require("../models/passwordresettoken");
const mongoose = require("mongoose");
const crypto = require("crypto");
const  EmailVerificationToken = require("../models/emailVerificationToken")
const { check, validationResult } = require("express-validator");
const mailer = require("../utils/mailUtils");
const JWT_SECRET = process.env.JWT_SECRET;

const createAccount = [
  check("email")
    .isEmail()
    .matches(/@gmail\.com$/)
    .withMessage("Chỉ chấp nhận email Gmail (@gmail.com)")
    .normalizeEmail(),

  check("password")
    .isLength({ min: 6 })
    .withMessage("Mật khẩu phải có ít nhất 6 ký tự"),

  check("full_name")
    .notEmpty()
    .trim()
    .escape()
    .withMessage("Họ tên không được để trống"),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, full_name } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ msg: "Email này đã được đăng ký" });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const role = await Role.findOne({ name: "User" });

      if (!role) {
        return res.status(500).json({ msg: "Không tìm thấy vai trò User" });
      }

      const newUser = await User.create({
        full_name,
        email,
        password: hashedPassword,
        id_roles: role._id,
        active: false,
      });

      const verificationToken = crypto.randomBytes(32).toString("hex");

      await PasswordResetToken.create({
        email: newUser.email,
        token: verificationToken,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      });

      const verificationLink = `${process.env.FRONTEND_URL || "http://localhost:8080"}/verify?token=${verificationToken}&email=${email}`;

      await mailer.sendMail(
        newUser.email,
       "Xác thực tài khoản của bạn - Loi Team",
          `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #4CAF50;">Chào mừng ${newUser.full_name}!</h2>
            <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>Loi Team</strong>.</p>
            <p>Vui lòng nhấn vào nút bên dưới để xác thực email (link hết hạn sau 15 phút):</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" 
                 style="background:#4CAF50; color:white; padding:12px 30px; text-decoration:none; border-radius:5px; font-weight:bold;">
                 XÁC THỰC TÀI KHOẢN
              </a>
            </p>
            <p>Nếu bạn không đăng ký, vui lòng bỏ qua email này.</p>
            <hr>
            <small>Trân trọng,<br><strong>Loi Team</strong></small>
          </div>
          `
      );

      res.status(201).json({
        message: "Đăng ký thành công! Vui lòng kiểm tra email để xác thực.",
      });

    } catch (error) {
      console.error("Lỗi đăng ký:", error);
      return res.status(500).json({
        message: "Đã có lỗi xảy ra.",
        error: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },
];
const verify_email = async (req, res) => {
  const { token, email } = req.query;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    const tokenEntry = await PasswordResetToken.findOne({ token: token });
    if (!tokenEntry) {
      return res.status(400).json({ message: "Token không hợp lệ" });
    }

    // Kiểm tra thời gian hết hạn
    if (tokenEntry.expiresAt < Date.now()) {
      await PasswordResetToken.deleteOne({ email }); // Xóa token hết hạn
      return res
        .status(400)
        .json({ message: "Token đã hết hiệu lực. Vui lòng yêu cầu lại." });
    }

    // Xác thực email
    user.verify_email = true;
    user.active = true;
    await user.save();

    // Xóa token sau khi sử dụng
    await PasswordResetToken.deleteOne({ email });

    res.status(200).json({ message: "Email đã được xác thực thành công" });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({
      message: "Đã xảy ra lỗi trong quá trình xác thực email",
      error: error.message,
    });
  }
};

const resendVerification = [
  // Validation
  check("email")
    .isEmail()
    .matches(/@gmail\.com$/)
    .withMessage("Chỉ chấp nhận email Gmail (@gmail.com)")
    .normalizeEmail(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
    
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(200).json({
          message: "Nếu email tồn tại, link xác thực đã được gửi lại!",
        });
      }
      if (user.active) {
        return res.status(400).json({
          message: "Tài khoản đã được kích hoạt rồi!",
        });
      }

      // Xóa token cũ (nếu có)
      await PasswordResetToken.deleteMany({ email });

      // Tạo token mới + thời hạn mới (15 phút)
      const newToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

      await PasswordResetToken.create({
        email,
        token: newToken,
        expiresAt,
      });

      // Gửi lại email
      const verificationLink = `${process.env.FRONTEND_URL || "http://localhost:8080"}/verify?token=${newToken}&email=${encodeURIComponent(email)}`;

      await mailer.sendMail(
        email,
        "Xác thực tài khoản - Link mới (hết hạn sau 15 phút)",
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #4CAF50;">Chào ${user.full_name || "bạn"}!</h2>
          <p>Chúng tôi nhận được yêu cầu gửi lại link xác thực tài khoản.</p>
          <p>Link mới có hiệu lực trong <strong>15 phút</strong>:</p>
          <p style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background:#4CAF50; color:white; padding:14px 32px; text-decoration:none; border-radius:6px; font-weight:bold; font-size:16px;">
               XÁC THỰC NGAY
            </a>
          </p>
          <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
          <small>Trân trọng,<br><strong>Loi Team</strong></small>
        </div>
        `
      );

      return res.status(200).json({
        message: "Link xác thực đã được gửi lại! Vui lòng kiểm tra email (kể cả mục Spam).",
      });

    } catch (error) {
      console.error("Resend verification error:", error);
      return res.status(500).json({
        message: "Có lỗi xảy ra, vui lòng thử lại sau.",
      });
    }
  },
];

const loginByEmailandPassword = async (req, res) => {
  const { email, password } = req.body;
  const userFind = await User.findOne({ email: email });
  if (!userFind) {
    return res.status(400).json({ message: "Email không tồn tại" });
  }
  const isMatch = await bcrypt.compare(password, userFind.password);
  if (!userFind.active) {
    return res.status(400).json({ message: "Tài khoản đã bị khoán" });
  }
  if (!isMatch) {
    return res.status(400).json({ message: "Sai mật khẩu" });
  }
  const token = jwt.sign({ user_id: userFind._id }, JWT_SECRET, {
    expiresIn: "1h",
  });
  res.status(200).json({ token: token, full_name: userFind.full_name });
};

const loginWithGoogle = passport.authenticate("google", {
  scope: ["profile", "email"],
});

const callBackURL = [
  passport.authenticate("google", {
    failureRedirect: "http://127.0.0.1:5500/fontend/Uniclub/User/account.html",
  }),
  async (req, res) => {
    try {
      // Cập nhật lastAccessTime
      const user = await User.findById(req.user._id);
      if (user) {
        if (!user.active) {
          user.active = true;
        }
        user.lastAccessTime = new Date(); // Cập nhật thời gian truy cập
        await user.save();
      }

      // Tạo JWT token
      const token = jwt.sign(
        { id: req.user._id, email: req.user.email }, // Payload
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Redirect kèm theo token và full_name trong URL
      res.redirect(
        `http://127.0.0.1:5500/fontend/Uniclub/User/home.html?token=${token}&full_name=${encodeURIComponent(
          user.full_name
        )}`
      );
    } catch (error) {
      console.error("Error in callback:", error);
      res.redirect("/login");
    }
  },
];

const logout = async (req, res) => {
  // Xóa cookie và chuyển hướng về trang đăng nhập
  res.clearCookie("token");
  res.redirect("/login");
};

// đăng nhập bằng facebook
const loginWithFacebook = passportFaceBook.authenticate("facebook");

const callBackUrlFaceBook = [
  passportFaceBook.authenticate("facebook", {
    failureRedirect: "http://127.0.0.1:5500/fontend/Uniclub/User/account.html", // Chuyển hướng đến trang đăng nhập nếu thất bại
  }),
  async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
      if (!user.active) {
        user.active = true; // Kích hoạt tài khoản nếu chưa kích hoạt
      }
      user.lastAccessTime = new Date(); // Cập nhật thời gian truy cập
      await user.save();
    }
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email }, // Payload
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.cookie("token", token, { httpOnly: true }); // Gửi token dưới dạng cookie

    res.redirect(
      `/home.html?token=${token}&full_name=${encodeURIComponent(
        user.full_name
      )}`
    );
  },
];

const send_mail_forgot_password = async (req, res) => {
  try {
    const { email } = req.body;
    console.log(email);

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy tài khoản" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = bcrypt.hashSync(resetToken, 10);

    // Thời gian hết hạn là 10 phút
    const expiresAt = new Date(Date.now() + 900000);
    console.log(expiresAt.getTime())
    await PasswordResetToken.deleteMany({ email: user.email });
    await PasswordResetToken.create({
      email: user.email,
      token: resetTokenHash,
      expiresAt: expiresAt,
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${email}`;
    await mailer.sendMail(
      user.email,
        "Yêu cầu đặt lại mật khẩu của bạn",
          `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào liên kết dưới đây để đặt lại mật khẩu của bạn:</p>
            <p style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" 
                 style="background:#4CAF50; color:white; padding:12px 30px; text-decoration:none; border-radius:5px; font-weight:bold;">
                Đặt lại mật khẩu
              </a>
            </p>
            
            <hr>
            <small>Trân trọng,<br><strong>Loi Team</strong></small>
          </div>
          `
    );

    res.json({ message: "Đã gửi email để khôi phục mật khẩu" });
  } catch (error) {
    console.error("Lỗi gửi email:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi gửi email" });
  }
};

const reset_password = async (req, res) => {
  const { email, token, newPassword } = req.body;

  

  try {
    // Tìm token trong cơ sở dữ liệu dựa trên email
    const tokenEntry = await PasswordResetToken.findOne({ email });
    
    console.log("expiresAt:", tokenEntry.expiresAt);
    console.log("expiresAt_ms:", tokenEntry.expiresAt.getTime());
    console.log("now:", new Date());
    console.log("now_ms:", Date.now());
    // Kiểm tra nếu token không tồn tại
    if (!tokenEntry) {
      return res.status(400).json({ message: "Token không hợp lệ" });
    }

    // Kiểm tra nếu token đã hết hạn
    if (tokenEntry.expiresAt < Date.now()) {
      return res.status(400).json({ message: "Token đã hết hạn" });
    }

    // So sánh token gốc với bản hash
    const tokenIsValid = bcrypt.compareSync(token, tokenEntry.token);
    if (!tokenIsValid) {
      return res.status(400).json({ message: "Token không hợp lệ" });
    }

    // Tìm user dựa trên email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại" });
    }

    // Cập nhật mật khẩu người dùng
    user.password = bcrypt.hashSync(newPassword, 10);
    await user.save();

    // Xóa token sau khi sử dụng
    await PasswordResetToken.deleteOne({ email });

    // Phản hồi thành công
    res.json({ message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    console.error("Lỗi đặt lại mật khẩu:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi khi đặt lại mật khẩu" });
  }
};

module.exports = {
  createAccount,
  verify_email,
  resendVerification,
  loginByEmailandPassword,
  loginWithGoogle,
  callBackURL,
  logout,
  loginWithFacebook,
  callBackUrlFaceBook,
  send_mail_forgot_password,
  reset_password,
};
