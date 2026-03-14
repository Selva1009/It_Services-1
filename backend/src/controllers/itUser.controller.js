const itUserEmployeeService=require("../services/itUsers.service")

exports.signup = async (req, res) => {
  try {
    const result = await itUserEmployeeService.createItUserEmployee(req.body);

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
  console.log(req,"req")
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