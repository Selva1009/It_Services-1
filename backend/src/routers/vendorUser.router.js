const express =require("express")
const router=express.Router();
const vendorUserController=require('../controllers/vendorUser.controller')

router.post("/signup",vendorUserController.signup)
module.exports = router;