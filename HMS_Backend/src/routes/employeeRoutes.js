const express = require("express");
const router  = express.Router(); 

const auth = require("../middlewares/authMiddleware")
const authorizeAdmin = require("../middlewares/authorizeAdmin")

const {getAllEmployees,getEmployeeById,addEmployee,updateEmployee} = require("../controllers/employeeController")
router.get("/",auth,authorizeAdmin,getAllEmployees);
router.get("/:employeeId",auth,authorizeAdmin,getEmployeeById);
router.post("/",auth,authorizeAdmin,addEmployee);
router.put("/:employeeId",auth,authorizeAdmin,updateEmployee);


module.exports = router;

