const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const authController = require("../middleware/authMiddleware");

// lấy danh sách thông tin user
router.get(
  "/users",
  authController.authMiddleware,
  authController.checkRoleUser,
  userController.get_all_users_information
);

// lock use by id
router.get("/lock-user", userController.lock_user_by_id);

// unlock user by id
router.get("/unlock-user", userController.unlock_user_by_id);

// cho phép user cập nhật hình ảnh của mình
router.post(
  "/upload-picture-user-by-id",
  upload.single("file"),
  userController.upload_picture_user_by_id
);

// lấy thông tin user bằng id
router.get(
  "/user-information",
  authController.authMiddleware,
  userController.get_user_by_id
);

// cập nhật lại passowrd for admin
router.put(
  "/update-password-admin",
  authController.authMiddleware,
  authController.checkRoleUser,
  userController.changes_for_admin
);

module.exports = router;
