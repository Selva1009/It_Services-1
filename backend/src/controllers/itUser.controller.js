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
