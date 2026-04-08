const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();

const vendorController = require("../controllers/vendorsAdmin.controller");
const authMiddleware = require("../middleware/auth.middleware");

const otpLimiter = rateLimit({
  windowMs: Number(process.env.OTP_RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000),
  max: Number(process.env.OTP_RATE_LIMIT_MAX || 5),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many OTP requests, please try again later." },
});

router.post("/signup", vendorController.signup);
router.post("/send-otp", otpLimiter, vendorController.sendOtp);
router.get("/profile", authMiddleware, vendorController.getVendorProfile);
router.put("/profile", authMiddleware, vendorController.updateVendorProfile);
router.get("/vendor-users", authMiddleware, vendorController.getVendorUsers);
module.exports = router;
