const express = require("express");
const router = express.Router();
const controller = require("../controllers/userAdmin.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/signup", controller.signup);
router.post("/send-otp", controller.sendOtp);
router.get("/profile", authMiddleware, controller.getUserAdminProfile);
router.put("/profile", authMiddleware, controller.editUserAdminProfile);
router.get("/It-users", authMiddleware, controller.getItUsers);
module.exports = router;
