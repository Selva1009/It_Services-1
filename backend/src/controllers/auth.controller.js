const authService=require("../services/auth.service")

exports.login=async(req,res)=>{
  console.log("login called");
  try{
    const result=await authService.login(req.body);
    res.json(result)

  }
  catch(err){
    res.status(err.status||400).json({
        message:err.message
    })
  }
}