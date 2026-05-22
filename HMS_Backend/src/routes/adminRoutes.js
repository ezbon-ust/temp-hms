const express = require("express");

const router = express.Router();

const auth =  require("../middlewares/authMiddleware"); 

const{
    getPendingUsers,
    approveUser,
    rejectUser,
    deactivateUser,
} = require('../controllers/adminController');

// PENDING REQUESTS
router.get("/pending-users",auth,getPendingUsers
);

// APPROVE USER
router.patch("/approve/:employeeId",auth, approveUser);

// REJECT USER
router.patch("/reject/:employeeId",auth,rejectUser
);

//DEACTIVATE USER
router.patch("/deactivate/:employeeId",auth,deactivateUser);

//DASHBOARD STATS
router.get("/dashboard-stats",auth,getDashboardStats);
