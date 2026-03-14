const db = require("../../db");
const bcrypt = require("bcryptjs");
const crypto=require("crypto")
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

exports.createVendorUser=async(data)=>{
    const{vendor_id,name,email,mobile,designation,password}=data
    
    //check vendor exsist

    const [vendor]= await db.query(
        "Select company_name from vendor_engineers_signup where id=?",
        [vendor_id]
    );

    if(vendor.length ===0){
        throw new Error("vendor not found");
    }

    const companyName=vendor[0].company_name;

    // Check duplicate email
  const [existing] = await db.query(
    "SELECT id FROM vendor_users WHERE email = ?",
    [email]
  );

  if (existing.length > 0) {
    throw new Error("Email already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
   const vendorUserToken = crypto.randomBytes(32).toString("hex");
    const authToken = jwt.sign(
    { vendor_id },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
   // Insert vendor user
  await db.query(
    `INSERT INTO vendor_users
     (vendor_id, company_name, name, email, mobile, designation, password,token)
     VALUES (?, ?, ?, ?, ?, ?, ?,?)`,
    [vendor_id, companyName, name, email, mobile, designation, hashedPassword,vendorUserToken]
  );

  return { message: "Vendor user created successfully", 
    token:vendorUserToken,
    authToken:authToken
   };
}



exports.getVendorUserProfile = async (vendor_id) => {
  const [vendor] = await db.query(
    `SELECT id, company_name, name, email, mobile, designation 
     FROM vendor_users 
     WHERE id = ?`,
    [vendor_id]
  );

  if (vendor.length === 0) {
    throw new Error("Vendor not found");
  }

  return vendor[0];
};

exports.updateVendorUserProfile = async (vendor_id, data) => {
  const { name, company_name, email, mobile, designation } = data;

  const [vendor] = await db.query(
    "SELECT id FROM vendor_users WHERE id = ?",
    [vendor_id]
  );

  if (vendor.length === 0) {
    throw new Error("Vendor not found");
  }

  await db.query(
    `UPDATE vendor_users 
     SET name = ?,company_name = ?, email = ?, mobile = ?, designation = ?
     WHERE id = ?`,
    [name ,company_name, email, mobile, designation, vendor_id]
  );

  return { message: "Profile updated successfully" };
};