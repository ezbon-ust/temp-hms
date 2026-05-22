const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail")

const Employee = require("../models/Employee");
const User = require("../models/User");
const { findOne } = require("../models/Counter");

//--------------Register----------------------------
exports.register = async (req, res) => {

  try {

    // BASE DATA
    const {
      email,
      password,
      name,
      phone,
      department,
      designation,
      joiningDate
    } = req.body;


    // CHECK EXISTING USER
    const existingUser = await User.findOne({ email });

    if (existingUser) {

      return res.status(409).json({
        success: false,
        message: "Email already registered"
      });
    }


    // HASH PASSWORD
    const passwordHash =
      await bcrypt.hash(password, 12);


    // EMPLOYEE OBJECT
    const employeeData = {
      email,
      name,
      phone,
      department,
      designation,
      joiningDate,
      status: "ACTIVE"
    };
    // ROLE BASED FIELDS
    // DOCTOR
    if (designation === "DOCTOR") {
      employeeData.medicalRegistrationNumber =
        req.body.medicalRegistrationNumber;

      employeeData.specialisation =
        req.body.specialisation;

      employeeData.qualification =
        req.body.qualification || [];
    }
    // NURSE
    if (designation === "NURSE") {

      employeeData.qualification =
        req.body.qualification || [];
    }
    // LAB TECH
    if (designation === "LAB_TECH") {

      employeeData.qualification =
        req.body.qualification || [];
    }
    // PHARMACIST
    if (designation === "PHARMACIST") {

      employeeData.qualification =
        req.body.qualification || [];
    }
    // CREATE EMPLOYEE
    const employee =
      new Employee(employeeData);

    const savedEmployee =
      await employee.save();
    // GENERATE VERIFICATION TOKEN
    const verification_token =
      crypto.randomBytes(32).toString("hex");
    const verification_token_expiry =
      new Date(
        Date.now() + 24 * 60 * 60 * 1000
      );
    // CREATE USER
    const user = await User.create({
      email,
      passwordHash,
      role: designation,
      employeeId:savedEmployee.employeeId,
      status: "PENDING",
      createdAt: new Date(),
      is_verified: false,
      verification_token,
      verification_token_expiry
    });
    // SEND EMAIL
    try {
      const verifyUrl =
        `${process.env.FRONTEND_URL}/verify-email?token=${verification_token}`;
      await sendEmail({
        to: user.email,
        subject: "HMS — Verify Your Email",
        html: `
          <h2>Welcome to HMS</h2>
          <p>Hello ${name}</p>
          <p>Please verify your email:</p>
          <a href="${verifyUrl}">
            Verify Email
          </a>
        `
      });
      console.log("Verification email sent");
    }
    catch (mailErr) {
      console.log(
        "Email failed:",
        mailErr.message
      );
    }
    // RESPONSE
    res.status(201).json({
      success: true,
      message:
        "Registration submitted successfully. Please verify your email and wait for admin approval."
    });
  }
  catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};
//-----------------Login----------------------------------------------

exports.login = async (req,res)=>{
  try{
    const {email,password} = req.body;

    const user = await User.findOne({email});
    if(!user)
      return res.status(401).json({message:"Invalid email"}); 

    const isMatch = await bcrypt.compare(password,user.passwordHash);
    if(!isMatch){
      return res.status(401).json({message:"Invalid email or password"})
    } 

    if(!user.is_verified){
      return res.status(401).json({message:"Please verify your email"})
    } 

    if(user.status==="PENDING"){
      return res.status(401).json({message:"Waiting for admin approval"})
    } 

     if(user.status==="REJECTED"){
      return res.status(401).json({message:"Your request for account creation was denied by admin"})
    } 
    
    if(user.status==="INACTIVE"){
      return res.status(401).json({message:"Your account has been deactivated. Please contact admin."})
    }  


    user.lastLoginAt = new Date();
    await user.save(); 

    const token = jwt.sign(
      { employeeId: user.employeeId, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );  
    
    const profile = await Employee.findOne({employeeId:user.employeeId});
    res.status(200).json({
      message:"Login successful",
      token,
    });

  }
  catch(err){
    res.status(500).json({message:err.message})

  }
} 

//----------------verify email--------------------------------
exports.verifyEmail = async (req, res) => {
  try {
    // GET TOKEN FROM QUERY
    const { token } = req.query;
    // TOKEN REQUIRED
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token missing"
      });
    }
    // FIND USER
    const user = await User.findOne({
      verification_token: token
    });
    // INVALID TOKEN
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification token"
      });
    }
    // CHECK TOKEN EXPIRY
    if (
      user.verification_token_expiry <
      new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "Verification token expired"
      });
    }


    // VERIFY USER
    user.is_verified = true;
    user.verification_token = null;
    user.verification_token_expiry = null;
    // SAVE
    await user.save();
    // RESPONSE
    return res.status(200).json({
      success: true,
      message:
        "Email verified successfully. Wait for admin approval."
    });
  }

  catch (err) {

    return res.status(500).json({

      success: false,

      message: err.message
    });
  }
};

//------------------profile-------------------------------
exports.profile = async (req,res)=>{
  try{
    console.log(req.user)
  const  user = await User.findOne({employeeId:req.user.employeeId}).select("-passwordHash -__v");
  const profile = await Employee.findOne({employeeId:user.employeeId}).select("-__v");
  return res.status(200).json({ 
    user:{
      id:user.employeeId,
      email:user.email,
      role:user.role,
      lastLoginAt:user.lastLoginAt,
      
    },
    profile
  })
}
catch(err){
   console.error("Me error:", err);
    res.status(500).json({ message: err.message });
}
};