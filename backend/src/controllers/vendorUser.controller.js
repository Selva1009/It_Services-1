const vendorUserService = require("../services/vendorUser.service");

exports.signup = async (req, res) => {
  try {
    const result = await vendorUserService.createVendorUser(req.body);
    
   res.json(result)

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

