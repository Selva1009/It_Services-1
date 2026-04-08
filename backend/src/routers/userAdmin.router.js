const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const controller = require("../controllers/userAdmin.controller");
const authMiddleware = require("../middleware/auth.middleware");

const otpLimiter = rateLimit({
  windowMs: Number(process.env.OTP_RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000),
  max: Number(process.env.OTP_RATE_LIMIT_MAX || 5),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many OTP requests, please try again later." },
});

router.post("/signup", controller.signup);
router.post("/send-otp", otpLimiter, controller.sendOtp);
router.get("/profile", authMiddleware, controller.getUserAdminProfile);
router.put("/profile", authMiddleware, controller.editUserAdminProfile);
router.get("/It-users", authMiddleware, controller.getItUsers);
module.exports = router;
