require("dotenv").config()
const app=require("./src/app")

const PORT = Number(process.env.PORT || process.env.API || 5000);

app.listen(PORT,()=>{ console.log(`Server running on port ${PORT}`)})
