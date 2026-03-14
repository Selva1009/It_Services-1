const express =require("express")
const router=express.Router();
const vendorUserController=require('../controllers/vendorUser.controller');
const authMiddleware = require("../middleware/auth.middleware");

router.post("/signup",vendorUserController.signup)
router.get("/profile", authMiddleware, vendorUserController.getVendorUserProfile);
router.put("/profile", authMiddleware, vendorUserController.updateVendorUserProfile);
module.exports = router;