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



exports.getUserAdminProfile = async (req, res) => {
  console.log(req,"request")
  try {
    const result = await service.getUserAdminProfile(req.users.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

exports.editUserAdminProfile = async (req, res) => {
  try {
    const result = await service.editUserAdminProfile(req.users.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

exports.getItUsers = async (req, res) => {
  console.log(req,"req")
  try {
    const user_id = req.users.id; 
    const result = await service.getAllItUsers(user_id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};