const vendorService = require("../services/vendorsAdmin.service");

//signup
exports.signup = async (req, res) => {
  try {
    const result = await vendorService.signup(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};



//otp
exports.sendOtp = async (req, res) => {
  try {
    const result = await vendorService.sendOtp(req.body.email);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};




