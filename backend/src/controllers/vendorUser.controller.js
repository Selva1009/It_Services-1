const vendorUserService = require("../services/vendorUser.service");

exports.signup = async (req, res) => {
  try {
    if (req.users?.role !== "vendor_admin") {
      return res.status(403).json({
        success: false,
        message: "Only vendor admins can create vendor users",
      });
    }

    const result = await vendorUserService.createVendorUser({
      ...req.body,
      vendor_id: req.users.id,
    });
    
   res.json(result)

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getVendorUserProfile = async (req, res) => {
  try {
    const vendor_id = req.users.id;
    const result = await vendorUserService.getVendorUserProfile(vendor_id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateVendorUserProfile = async (req, res) => {
  try {
    const vendor_id = req.users.id;
    const result = await vendorUserService.updateVendorUserProfile(vendor_id, req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
