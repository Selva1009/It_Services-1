const express =require("express")
const router=express.Router();
const itUserEmployeeController=require('../controllers/itUser.controller')
const authMiddleware = require("../middleware/auth.middleware");

router.post("/signup",itUserEmployeeController.signup)
router.get("/profile",  authMiddleware, itUserEmployeeController.getItUserEmployeeProfile);
router.put("/profile",  authMiddleware, itUserEmployeeController.editItUserEmployeeProfile);
module.exports = router;