const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../db");   // correct path
require("dotenv").config();
const {generateOtp,getOtpExpiry} =require("../utils/otp")
const JWT_SECRET = process.env.JWT_SECRET;
const crypto=require("crypto")


exports.signup = async (data) => {

  const {
    companyName,
    contactPerson,
    email,
    mobile,
    pan,
    gst,
    password,
    address,
    country,
    state,
    city,
    pincode,
    otp,
    services
  } = data;

  /* ---------- Basic validation ---------- */
  if (!email || !password)
    throw { status: 400, message: "Missing required fields" };

  /* ---------- Check vendor already exists ---------- */
  const [existingVendor] = await db.query(
    "SELECT id FROM vendor_engineers_signup WHERE email=?",
    [email]
  );

  if (existingVendor.length)
    throw { status: 400, message: "Vendor already registered" };

  /* ---------- OTP Verification ---------- */
  const [otpRows] = await db.query(
    "SELECT * FROM vendor_signup_otp WHERE email=? ORDER BY id DESC LIMIT 1",
    [email]
  );

  if (!otpRows.length)
    throw { status: 400, message: "OTP expired" };

  const dbOtp = String(otpRows[0].otp).trim();
  const userOtp = String(otp).trim();

  if (dbOtp !== userOtp)
    throw { status: 400, message: "Invalid OTP" };

  /* ---------- Password Hash ---------- */
  const hashedPassword = await bcrypt.hash(password, 10);

  /* ---------- Permanent Vendor Token ---------- */
  const vendorToken = crypto.randomBytes(32).toString("hex");

  /* ---------- Insert Vendor ---------- */
  const [vendorResult] = await db.query(
    `INSERT INTO vendor_engineers_signup
      (company_name, contact_person, email,
       mobile, pan, gst, password, vendor_token)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      companyName,
      contactPerson,
      email,
      mobile,
      pan,
      gst,
      hashedPassword,
      vendorToken
    ]
  );

  const vendorId = vendorResult.insertId;

  /* ---------- Insert Address ---------- */
  await db.query(
    `INSERT INTO vendor_company_addresses
     (vendor_id, address, country, state, city, pincode)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [vendorId, address, country, state, city, pincode]
  );

  /* ---------- Insert Services ---------- */
  if (services && services.length) {
    for (const svc of services) {
      await db.query(
        `INSERT INTO vendor_services
         (vendor_id, service_name, support_level)
         VALUES (?, ?, ?)`,
        [vendorId, svc.name, svc.level]
      );
    }
  }

  /* ---------- Remove OTP ---------- */
  await db.query(
    "DELETE FROM vendor_signup_otp WHERE email=?",
    [email]
  );

  /* ---------- Auth JWT Token ---------- */
  const authToken = jwt.sign(
    { vendorId },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  /* ---------- Response ---------- */
  return {
    message: "Vendor registered successfully",
    authToken,
    vendorToken,
    vendorId
  };
};


exports.sendOtp = async (email) => {

  if (!email)
    throw new Error("Email required");

   /* Check vendor already exists */
  const [vendors] = await db.query(
    "SELECT id FROM vendor_engineers_signup WHERE email=?",
    [email]
  );

  if (vendors.length) {
    throw new Error("Vendor already registered. Please login.");
  }


  const otp = generateOtp();
  const expiry = getOtpExpiry();

  await db.query(
    `INSERT INTO vendor_signup_otp (email, otp, expires_at)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE otp=?, expires_at=?`,
    [email, otp, expiry, otp, expiry]
  );

  console.log("Generated OTP:", otp);

  return { message: "OTP sent successfully" };
};


exports.getVendorProfile= async(vendorId)=> {

  if (!vendorId) throw {status:400,message:"vendor ID Required"}
  
    const [vendorRows] = await db.query(
    `SELECT 
      id, company_name, contact_person, email, 
      mobile, pan, gst, vendor_token, created_at
     FROM vendor_engineers_signup 
     WHERE id = ?`,
    [vendorId]
  );

  if(!vendorRows.length){
    throw {status:404,message:"vendor not found"}
  }
  
  const vendor = vendorRows[0];

  const [addressRows]=await db.query(
    `SELECT 
      address, country, state, city, pincode
     FROM vendor_company_addresses 
     WHERE vendor_id = ?`,
    [vendorId]
  )

    const [serviceRows] = await db.query(
    `SELECT 
      id, service_name, support_level
     FROM vendor_services 
     WHERE vendor_id = ?`,
    [vendorId]
  );

   return {
    message: "Vendor profile fetched successfully",
    data: {
      id: vendor.id,
      companyName: vendor.company_name,
      contactPerson: vendor.contact_person,
      email: vendor.email,
      mobile: vendor.mobile,
      pan: vendor.pan,
      gst: vendor.gst,
      vendorToken: vendor.vendor_token,
      createdAt: vendor.created_at,
      address: addressRows.length ? addressRows[0] : null,
      services: serviceRows || []
    }
  };


}



exports.updateVendorProfile=async(vendorId,data)=>{
  if(!vendorId) throw {status:400,message:"vendor id required"}

   const {
    contactPerson,
    mobile,
    gst,
    address,
    country,
    state,
    city,
    pincode,
  } = data;


  await db.query(
    `UPDATE vendor_engineers_signup
     SET contact_person = ?,
         mobile         = ?,
         gst            = ?
     WHERE id = ?`,
    [contactPerson, mobile, gst, vendorId]
  )

  const [addressRows] = await db.query(
    `SELECT id FROM vendor_company_addresses WHERE vendor_id = ?`,
    [vendorId]
  );

   if (addressRows.length) {
    /* ---------- Update address ---------- */
    await db.query(
      `UPDATE vendor_company_addresses
       SET address = ?,
           country = ?,
           state   = ?,
           city    = ?,
           pincode = ?
       WHERE vendor_id = ?`,
      [address, country, state, city, pincode, vendorId]
    );
  } else {
    /* ---------- Insert address if not exists ---------- */
    await db.query(
      `INSERT INTO vendor_company_addresses
       (vendor_id, address, country, state, city, pincode)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [vendorId, address, country, state, city, pincode]
    );
  }
  


  /* ---------- Fetch updated profile ---------- */
  const [vendorRows] = await db.query(
    `SELECT
       id, company_name, contact_person, email,
       mobile, pan, gst, created_at
     FROM vendor_engineers_signup
     WHERE id = ?`,
    [vendorId]
  );

  const [updatedAddress] = await db.query(
    `SELECT address, country, state, city, pincode
     FROM vendor_company_addresses
     WHERE vendor_id = ?`,
    [vendorId]
  );

 const [services] = await db.query(
    `SELECT id, service_name, support_level
     FROM vendor_services
     WHERE vendor_id = ?`,
    [vendorId]
  );

  const vendor = vendorRows[0];

   return {
    message: "Profile updated successfully",
    data: {
      id:            vendor.id,
      companyName:   vendor.company_name,
      contactPerson: vendor.contact_person,
      email:         vendor.email,
      mobile:        vendor.mobile,
      pan:           vendor.pan,
      gst:           vendor.gst,
      createdAt:     vendor.created_at,
      address:       updatedAddress[0] || null,
      services:      services || [],
    },
  };

}


exports.getVendorUsers = async (vendor_id) => {
  const [users] = await db.query(
    `SELECT id, name, email, mobile, designation, created_at 
     FROM vendor_users 
     WHERE vendor_id = ?`,
    [vendor_id]
  );
  return { total: users.length, users };
};