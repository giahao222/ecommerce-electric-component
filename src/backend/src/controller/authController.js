require("dotenv").config();
const Role = require("../models/roles");
const User = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const passportFaceBook = require("../config/facebookConfig");
const PasswordResetToken = require("../models/passwordresettoken");
const crypto = require("crypto");

const { check, validationResult } = require("express-validator");
const mailer = require("../utils/mailUtils");
const JWT_SECRET = process.env.JWT_SECRET;

const createAccount = [
  check("email").isEmail().withMessage("Please enter a valid email address"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  check("full_name").notEmpty().withMessage("Username is required"),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    console.log("!");
    const { email, password, full_name } = req.body;
    try {
      const user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: "Email này đã được đăng kí" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const role = await Role.findOne({ name: "User" });
      if (!role) {
        return res.status(500).json({ msg: "Role not found" });
      }

      const newUser = new User({
        full_name: full_name,
        email: email,
        password: hashedPassword,
        id_roles: role._id,
        active: true,
      });

      // Generate a verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationLink = `http://localhost:8080/verify?token=${verificationToken}&email=${newUser.email}`;

      const expiresAt = new Date(Date.now() + 60000); // 5 minute from now

      await PasswordResetToken.create({
        email: newUser.email,
        token: verificationToken,
        expiresAt: expiresAt,
      });

      await newUser.save();

      // Send verification email
      mailer.sendMail(
        newUser.email,
        "Welcome! Confirm Your Email to Start Exploring",
        `<p>Hi ${newUser.full_name},</p>
        <p>Welcome to our platform! We’re excited to have you on board.</p>
        <p>To get started, please verify your email by clicking the link below:</p>
        <p><a href="${verificationLink}" style="color: #4CAF50;">Verify My Account</a></p>
        <p>If you didn’t create this account, please ignore this email.</p>
        <p>Best regards,<br>Loi Team</p>`
      );

      res.status(201).json({
        message:
          "Tài khoản đã được đăng kí thành công ! Hãy kiểm tra xác thực trong hộp thư của bạn",
      });
    } catch (error) {
      return res.status(500).json({
        message: "An error occurred on the server",
        error: error.message,
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
const loginWithFacebook = passportFaceBook.authenticate("facebook", {
  scope: "email",
});

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
      `http://127.0.0.1:5500/fontend/Uniclub/User/home.html?token=${token}&full_name=${encodeURIComponent(
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

    // Thời gian hết hạn là 1 phút
    const expiresAt = new Date(Date.now() + 3600000);

    await PasswordResetToken.create({
      email: user.email,
      token: resetTokenHash,
      expiresAt: expiresAt,
    });

    const resetLink = `${process.env.FRONTEND_URL}?token=${resetToken}&email=${email}`;
    await mailer.sendMail(
      user.email,
      "Yêu cầu đặt lại mật khẩu của bạn",
      `<p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào liên kết dưới đây để đặt lại mật khẩu của bạn:</p>
       <a href="${resetLink}">Đặt lại mật khẩu</a>`
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
  loginByEmailandPassword,
  loginWithGoogle,
  callBackURL,
  logout,
  loginWithFacebook,
  callBackUrlFaceBook,
  send_mail_forgot_password,
  reset_password,
};
