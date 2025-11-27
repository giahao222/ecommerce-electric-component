const express = require("express");
const router = express.Router();
const authController = require("../middleware/authMiddleware");
const reportController = require("../controller/reportController");

// lấy thông tin của report
router.get(
  "/get-report",
  authController.authMiddleware,
  authController.checkRoleUser,
  reportController.report
);

router.get(
  "/get-quarterly-report",
  authController.authMiddleware,
  authController.checkRoleUser,
  reportController.getQuarterlyReport
);

router.get(
  "/get-report-information",
  authController.authMiddleware,
  authController.checkRoleUser,
  reportController.information_report
);
module.exports = router;
