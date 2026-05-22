const User = require("../models/User");
const Employee = require("../models/Employee")

// GET ALL PENDING USERS
exports.getPendingUsers = async (req, res) => {
  try {
    const pendingUsers = await User.find({
      status: "PENDING",
      is_verified: true
    }).select(
      "-passwordHash -verification_token -verification_token_expiry"
    );
    return res.status(200).json({
      success: true,
      count: pendingUsers.length,
      data: pendingUsers
    });
  }
  catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// APPROVE USER
exports.approveUser = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const user = await User.findOne({employeeId});

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.status = "ACTIVE";
    await user.save();
    
    // GET EMPLOYEE DETAILS
    const employee = await Employee.findOne({
      employeeId
    });


    // SEND APPROVAL MAIL
    try {

      await sendEmail({

        to: user.email,

        subject: "HMS Account Approved",

        html: `

          <h2>Account Approved</h2>

          <p>Hi ${employee.name},</p>

          <p>Your HMS account has been approved by admin.</p>

          <p>You can now login to the system using below link</p>
          <a href="https://temp-hms.vercel.app/login">Login </a>
        `
      });

      console.log("Approval mail sent");

    }

    catch (mailErr) {

      console.log(
        "Approval email failed:",
        mailErr.message
      );
    }



    return res.status(200).json({
      success: true,
      message: "User approved successfully"
    });
}

  catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};


// REJECT USER
exports.rejectUser = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const user = await User.findOne({
      employeeId
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.status = "REJECTED";
    await user.save();
    return res.status(200).json({
     success: true,
     message: "User rejected successfully"
    });
  }
  catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
}; 

//Deactivate User
exports.deactivateUser = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const user = await User.findOne({
      employeeId
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    user.status = "INACTIVE";
    await user.save();
    return res.status(200).json({
     success: true,
     message: "User deactivated successfully"
    });
  }
  catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
}; 

//Dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    // TOTAL EMPLOYEES
    const totalEmployees =
      await Employee.countDocuments();
    // ACTIVE USERS
    const activeEmployees =
      await User.countDocuments({
        status: "ACTIVE"
      });
    // PENDING REQUESTS
    const pendingRequests =
      await User.countDocuments({
        status: "PENDING",
        is_verified: true
      });
    // DOCTORS COUNT
    const doctors =
      await Employee.countDocuments({
        designation: "DOCTOR"
      });
    // NURSES COUNT
    const nurses =
      await Employee.countDocuments({
        designation: "NURSE"
      });
    // LAB TECH COUNT
    const labTechs =
      await Employee.countDocuments({
        designation: "LAB_TECH"
      });
    // PHARMACISTS COUNT
    const pharmacists =
      await Employee.countDocuments({
        designation: "PHARMACIST"
      });
    return res.status(200).json({
      success: true,
      data: {
        totalEmployees,
        activeEmployees,
        pendingRequests,
        doctors,
        nurses,
        labTechs,
        pharmacists
      }
    });
  }
  catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message
    });
  }
};