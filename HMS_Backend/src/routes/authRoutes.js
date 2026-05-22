const express = require("express");
const router = express.Router(); 


const { signupValidation } =require('../validation/authValidation');
const validate = require('../middlewares/validate')

const{register,login,profile,verifyEmail} = require("../controllers/authController")
const auth = require("../middlewares/authMiddleware")

router.post("/register",signupValidation,validate,register);
router.post("/login",login);
router.get("/me",auth,profile);
router.get("/verify-email",verifyEmail)


module.exports = router;