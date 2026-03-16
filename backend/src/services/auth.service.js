
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../db");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

const buildUserProfile = (user, tableMeta, parentIdFromToken) => {
  const emailValue = user.email || user.Email || null;
  const firstName = user.firstName || user.first_name || null;
  const lastName = user.lastName || user.last_name || null;
  const nameValue =
    user.name || user.contact_person ||
    user.personName ||
    user.person_name ||
    [firstName, lastName].filter(Boolean).join(" ") ||
    null;

  const phoneValue =
    user.phone ||
    user.phoneNumber ||
    user.mobile ||
    user.contactNumber ||
    null;

  const companyName =
    user.company_name ||
    user.companyName ||
    user.companyname ||
    null;

  const vendorName =
    user.vendor_name ||
    user.vendorName ||
    companyName ||
    null;

  const createdAt = user.created_at || user.createdAt || null;
  const department = user.department || null;
  const designation = user.designation || null;
  const status = user.status || null;
  const permissions =
    user.permissions ||
    user.permission ||
    user.access_roles ||
    user.accessRoles ||
    user.roles ||
    null;

  const parentId =
    parentIdFromToken ||
    (tableMeta.parentField ? user[tableMeta.parentField] : null) ||
    null;

  const profile = {
    id: user.id || null,
    name: nameValue,
    email: emailValue,
    phone: phoneValue,
    company_name: companyName,
    vendor_name: vendorName,
    parentId,
    department,
    designation,
    status,
    created_at: createdAt,
    permissions,
    role: tableMeta.role,
    vendor_id: null,
    admin_id: null,
  };

  if (tableMeta.role === "vendor_user") {
    profile.vendor_id = parentId || user.vendor_id || null;
  }

  if (tableMeta.role === "it_user") {
    profile.admin_id = parentId || user.user_id || null;
  }

  const cleaned = {};
  Object.entries(profile).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== "") {
      cleaned[key] = value;
    }
  });

  return cleaned;
};



exports.login = async ({ email, password }) => {
  if (!email || !password)
    throw { status: 400, message: "Missing credentials" };

  const tables = [
    { table: "vendor_engineers_signup", role: "vendor_admin", id: "id", token: "vendor_token" },
    { table: "it_user_admin_signup", role: "it_admin", id: "id", token: "user_token" },
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

  const userProfile = buildUserProfile(
    foundUser,
    foundTable,
    tokenPayload.parentId
  );

  return {
    message: "Login successful",
    role: foundTable.role,
    authToken: token,
    userToken: foundUser[foundTable.token],
    id: foundUser[foundTable.id],
    user: userProfile,
  };
};
