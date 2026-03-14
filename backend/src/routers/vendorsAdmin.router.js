const express = require("express");
const router = express.Router();

const vendorController = require("../controllers/vendorsAdmin.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/signup", vendorController.signup);
router.post("/send-otp", vendorController.sendOtp);
router.get("/profile", authMiddleware, vendorController.getVendorProfile);
router.put("/profile", authMiddleware, vendorController.updateVendorProfile);
router.get("/vendor-users", authMiddleware, vendorController.getVendorUsers);
module.exports = router;
