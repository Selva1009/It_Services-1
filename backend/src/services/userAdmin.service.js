const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../db");
const { generateOtp, getOtpExpiry } = require("../utils/otp");
require("dotenv").config();

const crypto=require("crypto")
const JWT_SECRET = process.env.JWT_SECRET;

exports.signup = async (data) => {

  const {
    companyName,
    registrationNumber,
    companyWebsite,
    gstNumber,
    firstName,
    lastName,
    phone,
    email,
    password,
    address,
    country,
    state,
    city,
    pincode,
    otp
  } = data;

  if (!email || !password)
    throw { status: 400, message: "Missing fields" };

  /* Check existing user */
  const [existing] = await db.query(
    "SELECT id FROM it_user_admin_signup WHERE email=?",
    [email]
  );

  if (existing.length)
    throw { status: 400, message: "User already exists" };

  /* OTP Verification */
  const [otpRows] = await db.query(
    "SELECT * FROM it_user_signup_otp WHERE email=? ORDER BY id DESC LIMIT 1",
    [email]
  );

  if (!otpRows.length)
    throw { status: 400, message: "OTP expired" };

  if (String(otpRows[0].otp) !== String(otp))
    throw { status: 400, message: "Invalid OTP" };

  /* Hash password */
  const hashedPassword = await bcrypt.hash(password, 10);
   const userToken = crypto.randomBytes(32).toString("hex");
  /* Insert user */
  const [result] = await db.query(
    `INSERT INTO it_user_admin_signup
     (company_name, registration_number, company_website,
      gst_number, first_name, last_name, phone, email, password,user_token)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?)`,
    [
      companyName,
      registrationNumber,
      companyWebsite,
      gstNumber,
      firstName,
      lastName,
      phone,
      email,
      hashedPassword,
      userToken
    ]
  );

  const userId = result.insertId;

  /* Insert address */
  await db.query(
    `INSERT INTO it_user_addresses
     (user_id, address, country, state, city, pincode)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, address, country, state, city, pincode]
  );

  /* Remove OTP */
  // await db.query(
  //   "DELETE FROM it_user_signup_otp WHERE email=?",
  //   [email]
  // );

  /* Generate token */
  const token = jwt.sign(
    { id: userId, role: "buyer" },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return {
    message: "Signup successful",
    authToken: token,
    userId,
    userToken
  };
};

exports.sendOtp = async (email) => {

  console.log("sendOtp called:", email);

  const otp = generateOtp();
  const expiry = getOtpExpiry();

  try {
    const result = await db.query(
      `INSERT INTO it_user_signup_otp (email, otp, expires_at)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE otp=?, expires_at=?`,
      [email, otp, expiry, otp, expiry]
    );

    console.log("DB result:", result);
  } catch (err) {
    console.error("DB insert error:", err);
  }

  console.log("Generated OTP:", otp);

  return { message: "OTP sent successfully" };
};


// GET /profile/:userId
exports.getUserAdminProfile = async (userId) => {
  const [rows] = await db.query(
    `SELECT 
       u.id, u.company_name, u.registration_number, u.company_website,
       u.gst_number, u.first_name, u.last_name, u.phone, u.email,
       a.address, a.country, a.state, a.city, a.pincode
     FROM it_user_admin_signup u
     LEFT JOIN it_user_addresses a ON a.user_id = u.id
     WHERE u.id = ?`,
    [userId]
  );

  if (!rows.length) throw { status: 404, message: "User not found" };

  return { profile: rows[0] };
};

// PUT
exports.editUserAdminProfile = async (userId, data) => {
  const {
    companyName, registrationNumber, companyWebsite,
    gstNumber, firstName, lastName, phone,
    address, country, state, city, pincode
  } = data;

  // Update user table (email & password excluded from edit)
  await db.query(
    `UPDATE it_user_admin_signup SET
       company_name=?, registration_number=?, company_website=?,
       gst_number=?, first_name=?, last_name=?, phone=?
     WHERE id=?`,
    [companyName, registrationNumber, companyWebsite,
     gstNumber, firstName, lastName, phone, userId]
  );

  // Upsert address
  await db.query(
    `INSERT INTO it_user_addresses (user_id, address, country, state, city, pincode)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       address=VALUES(address), country=VALUES(country),
       state=VALUES(state), city=VALUES(city), pincode=VALUES(pincode)`,
    [userId, address, country, state, city, pincode]
  );

  return { message: "Profile updated successfully" };
};

exports.getAllItUsers = async (user_id) => {
  const [users] = await db.query(
    `SELECT id, name, email, mobile, designation, created_at 
     FROM it_users_employee 
     WHERE user_id = ?`,
    [user_id]
  );
  return { total: users.length, users };
};