const db = require("../../db");
const bcrypt = require("bcryptjs");
const crypto=require("crypto")
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

exports.createItUserEmployee=async(data)=>{
    const{user_id,name,email,mobile,designation,password}=data
    
    //check vendor exsist

    const [userEmployee]= await db.query(
        "Select company_name from it_user_admin_signup where id=?",
        [user_id]
    );

    if(userEmployee.length ===0){
        throw new Error("Employee not found");
    }

    const companyName=userEmployee[0].company_name;

    // Check duplicate email
  const [existing] = await db.query(
    "SELECT id FROM it_users_employee WHERE email = ?",
    [email]
  );

  if (existing.length > 0) {
    throw new Error("Email already exists");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  const itUserEmployeeToken = crypto.randomBytes(32).toString("hex");

   const authToken = jwt.sign(
      { user_id },
      JWT_SECRET,
      { expiresIn: "7d" }
    );
   // Insert vendor user
  await db.query(
    `INSERT INTO it_users_employee
     (user_id, company_name, name, email, mobile, designation, password,token)
     VALUES (?, ?, ?, ?, ?, ?, ?,?)`,
    [user_id, companyName, name, email, mobile, designation, hashedPassword,itUserEmployeeToken]
  );

  return { 
    message: "It user Employee created successfully",
    token:itUserEmployeeToken,
    authToken:authToken,
   };
}




exports.getItUserEmployeeProfile = async (userId) => {
  const [rows] = await db.query(
    `SELECT id, company_name, name, email, mobile, designation
     FROM it_users_employee
     WHERE id = ?`,
    [userId]
  );

  if (rows.length === 0) throw { status: 404, message: "User not found" };

  return { profile: rows[0] };
};

exports.editItUserEmployeeProfile = async (userId, data) => {
  const { name, mobile, designation } = data;

  await db.query(
    `UPDATE it_users_employee
     SET name=?, mobile=?, designation=?
     WHERE id=?`,
    [name, mobile, designation, userId]
  );

  return { message: "Profile updated successfully" };
};




