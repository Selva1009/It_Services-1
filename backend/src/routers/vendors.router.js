const express = require("express");
const router = express.Router();

const vendorController = require("../controllers/vendors.controller");

router.post("/signup", vendorController.signup);
router.post("/send-otp", vendorController.sendOtp);



module.exports = router;
