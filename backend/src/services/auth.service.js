
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../db");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;



exports.login = async ({ email, password }) => {
  if (!email || !password)
    throw { status: 400, message: "Missing credentials" };

  const tables = [
    { table: "vendor_engineers_signup", role: "vendor_admin", parentField: null, token: "vendor_token" },
    { table: "it_user_admin_signup", role: "it_admin", parentField: null, token: "user_token" },
    { table: "vendor_users", role: "vendor_user", parentField: "vendor_id", token: "token" },
    { table: "it_users_employee", role: "it_user", parentField: "user_id", token: "token" },
  ];

  let foundUser = null;
  let foundTable = null;

  // 🔍 First find user by email
  for (const t of tables) {
    const [rows] = await db.query(
      `SELECT * FROM ${t.table} WHERE email=?`,
      [email]
    );

    if (rows.length) {
      foundUser = rows[0];
      foundTable = t;
      break;
    }
  }

  // ❌ If no user found
  if (!foundUser)
    throw { status: 404, message: "User not found" };

  // 🔐 Check password
  const valid = await bcrypt.compare(password, foundUser.password);

  if (!valid)
    throw { status: 401, message: "Invalid email or password" };

  // ✅ Generate token
  const tokenPayload = {
    id: foundUser.id,
    role: foundTable.role,
  };

  if (foundTable.parentField) {
    tokenPayload.parentId = foundUser[foundTable.parentField];
  }

  const token = jwt.sign(tokenPayload, JWT_SECRET, {
    expiresIn: "7d",
  });

  return {
    message: "Login successful",
    role: foundTable.role,
    authToken: token,
    userToken: foundUser[foundTable.token]
  };
};