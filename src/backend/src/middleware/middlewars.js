const checkAuth = (req, res, next) => {
  if (!req.session.username) {
    res.redirect("/login");
  }
  next(); // Nếu đã đăng nhập, tiếp tục đến route tiếp theo
};

module.exports = { checkAuth };
