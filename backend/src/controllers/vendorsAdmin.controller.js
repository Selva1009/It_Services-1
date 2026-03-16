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


//vendor profile
exports.getVendorProfile = async (req, res) => {
  try {
    const vendorId = req.users?.id;
    if (!vendorId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const result = await vendorService.getVendorProfile(vendorId);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};


exports.updateVendorProfile = async (req, res) => {
  try {
    const vendorId = req.users.id;  
    const result = await vendorService.updateVendorProfile(vendorId, req.body);
    res.status(200).json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

exports.getVendorUsers = async (req, res) => {
  console.log(req,"req")
  try {
    const vendor_id = req.users.id; 
    const result = await vendorService.getVendorUsers(vendor_id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


