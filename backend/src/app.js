const express =require("express")
const cors =require('cors')

const vendorRoutes =require("./routers/vendorsAdmin.router")
const authRoutes=require("./routers/auth.router")
const itUserRoutes=require("./routers/userAdmin.router")
const vendorUser=require("./routers/vendorUser.router")
const itUserEmployee=require("./routers/itUser.router")
const app=express()

app.use(cors());
app.use(express.json())

app.use("/api/vendor-admin",vendorRoutes)
app.use("/api/user-admin",itUserRoutes)
app.use("/api/auth",authRoutes)
app.use("/api/vendor-user",vendorUser)
app.use("/api/it-user-employee",itUserEmployee)


module.exports=app