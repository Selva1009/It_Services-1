const express =require("express")
const cors =require('cors')

const vendorRoutes =require("./routers/vendorsAdmin.router")
const authRoutes=require("./routers/auth.router")
const itUserRoutes=require("./routers/userAdmin.router")
const vendorUser=require("./routers/vendorUser.router")
const itUserEmployee=require("./routers/itUser.router")
const ticketRoutes=require("./routers/tickets.router")
const notificationRoutes=require("./routers/notifications.router")
const app=express()

const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (!allowedOrigins.length) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json())

app.use("/api/vendor-admin",vendorRoutes)
app.use("/api/user-admin",itUserRoutes)
app.use("/api/auth",authRoutes)
app.use("/api/vendor-user",vendorUser)
app.use("/api/it-user-employee",itUserEmployee)
app.use("/api/tickets", ticketRoutes)
app.use("/api/notifications", notificationRoutes)


module.exports=app
