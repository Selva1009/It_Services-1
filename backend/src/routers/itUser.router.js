const express = require("express");
const router = express.Router();
const controller = require("../controllers/itUser.controller");

router.post("/signup", controller.signup);
router.post("/send-otp", controller.sendOtp);
module.exports = router;
