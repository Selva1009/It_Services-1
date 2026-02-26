const service = require("../services/userAdmin.service");

exports.signup = async (req, res) => {
  try {
    const result = await service.signup(req.body);
    res.json(result);
  } catch (err) {
    res.status(err.status || 400).json({
      message: err.message
    });
  }
};

//otp
exports.sendOtp = async (req, res) => {
  try {
    const result = await service.sendOtp(req.body.email);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};