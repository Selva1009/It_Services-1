
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../db");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;



exports.login = async ({ email, password }) => {
 console.log("email",email)
  if (!email || !password)
    throw { status: 400, message: "Missing credentials" };

  /* Check vendor */
  const [vendors] = await db.query(
    "SELECT * FROM vendor_engineers_signup WHERE email=?",
    [email]
  );
  console.log([vendors])
  if (vendors.length) {
    const vendor = vendors[0];
    console.log(vendor)
   const valid = await bcrypt.compare(password, vendor.password);
   console.log(valid)
    if (!valid)
      throw { status: 400, message: "Invalid password" };

    const token = jwt.sign(
      { id: vendor.id, role: "vendor" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return {
      message: "Login successful",
      role: "vendor Admin",
      authToken: token
    };
  }

  /* Check buyer */
  const [buyers] = await db.query(
    "SELECT * FROM it_users_signup WHERE email=?",
    [email]
  );
   console.log([buyers],"buyer")
  if (!buyers.length)
    throw { status: 404, message: "User not found" };

  const buyer = buyers[0];

  const valid = await bcrypt.compare(password, buyer.password);

  if (!valid)
    throw { status: 400, message: "Invalid password" };

  const token = jwt.sign(
    { id: buyer.id, role: "buyer" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    message: "Login successful",
    role: "buyer",
    authToken: token
  };
};
