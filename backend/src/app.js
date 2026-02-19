const express =require("express")
const cors =require('cors')

const vendorRoutes =require("./routers/vendors.router")
const authRoutes=require("./routers/auth.router")
const itUserRoutes=require("./routers/itUser.router")
const app=express()

app.use(cors());
app.use(express.json())

app.use("/api/vendor",vendorRoutes)
app.use("/api/itUser",itUserRoutes)
app.use("/api/auth",authRoutes)


module.exports=app