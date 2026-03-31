const express =require("express")
const rateLimit = require("express-rate-limit")
const router =express.Router()

const authController=require("../controllers/auth.controller")

const loginLimiter = rateLimit({
  windowMs: Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS),
  max: Number(process.env.LOGIN_RATE_LIMIT_MAX),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again later." },
})

router.post('/login',loginLimiter,authController.login)

module.exports=router
