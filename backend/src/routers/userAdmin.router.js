const express = require("express");
const router = express.Router();
const controller = require("../controllers/userAdmin.controller");

router.post("/signup", controller.signup);
router.post("/send-otp", controller.sendOtp);
module.exports = router;
