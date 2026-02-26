const express =require("express")
const router=express.Router();
const itUserEmployeeController=require('../controllers/itUser.controller')

router.post("/signup",itUserEmployeeController.signup)
module.exports = router;