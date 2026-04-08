const itUserEmployeeService=require("../services/itUsers.service")

exports.signup = async (req, res) => {
  try {
    if (req.users?.role !== "it_admin") {
      return res.status(403).json({
        success: false,
        message: "Only IT admins can create IT users",
      });
    }

    const result = await itUserEmployeeService.createItUserEmployee({
      ...req.body,
      user_id: req.users.id,
    });

    res.status(201).json({
      result
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.getItUserEmployeeProfile = async (req, res) => {
  try {
    const result = await itUserEmployeeService.getItUserEmployeeProfile(req.users.id);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

exports.editItUserEmployeeProfile = async (req, res) => {
  try {
    const result = await itUserEmployeeService.editItUserEmployeeProfile(req.users.id, req.body);
    res.json(result);
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};
