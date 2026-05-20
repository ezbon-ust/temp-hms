const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail")

const Employee = require("../models/Employee");
const User = require("../models/User");
const { findOne } = require("../models/Counter");


exports.signup = async (req,res)=>{ 
 
    try{
       const{ email,
        password,
        name,
        phone,
        department,
        designation,
        status,
        joiningDate,
        medicalRegistrationNumber,
        specialisation,
        qualification,
        consultationFee,
        availabilitySlots} = req.body;
         
        const existingUser = await User.findOne({ email });
        if (existingUser) {
        return res.status(409).json({ message: "Email already registered" });
        }
        

        const password_hash = await bcrypt.hash(password,12);

 
    const employee = new Employee({
  email,
  name,
  phone,
  department,
  designation,
  status,
  joiningDate,

  medicalRegistrationNumber,
  specialisation,
  qualification,
  consultationFee,
  availabilitySlots
});
        
        const savedEmployee = await employee.save(); 
       
        
     // Generate verification token
    const verification_token = crypto.randomBytes(32).toString("hex");
    const verification_token_expiry = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    ); // 24 hours


     const user = await User.create({
      email,
      passwordHash:password_hash,
      role:designation,
      employeeId: savedEmployee.employeeId,
      createdAt: new Date(),
      lastLoginAt:new Date(),
      verification_token,
      verification_token_expiry,
     
    }); 

    // Send verification email
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verification_token}`;
    await sendEmail({
      to: user.email,
      subject: "HMS — Verify Your Email",
      html: `
        <h2>Welcome to HMS</h2>
        <p>Hi ${first_name}, thank you for registering.</p>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verifyUrl}" target="_blank">${verifyUrl}</a>
        <p>This link expires in <strong>24 hours</strong>.</p>
        <p>If you did not create an account, please ignore this email.</p>
      `,
    });

  
    
    res.status(201).json({
      message:
        "Account created successfully. ",
        
    });


    }
    catch(err){
        res.status(500).json({
            success:false,
            message:err.message
        });
    }
    
}
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

//------------------profile-------------------------------
exports.me = async (req,res)=>{
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