const express = require("express");
const{
    followandUnfollowUser,
    updateProfile,
    deleteMyProfile,
    myProfile,
    getUserProfile,
    getAllUsers
} = require("../controllers/user");

const {
    resetPasswordToken,
    resetPassword,
} = require("../controllers/ResetPassword");


const {
    login,
    signUp,
    sendOtp,
    changePassword,
    logout,
} = require("../controllers/Auth");

const { auth } = require("../middleware/auth");

const router = express.Router();

// ********************************************************************************************************
//                                      Authenticate
// ********************************************************************************************************


router.route("/signUp").post(signUp);

router.route("/login").post(login);

router.route("/sendotp", sendOtp);

router.route("/logout").get(logout);

router.route("/changepassword", auth, changePassword);


// ********************************************************************************************************
//                                      Reset Password
// ********************************************************************************************************

// Route for generating a reset password token
router.post("/reset-password-token", resetPasswordToken)

// Route for resetting user's password after verification
router.post("/reset-password", resetPassword);


// ********************************************************************************************************
//                                      User Intraction
// ********************************************************************************************************


router.route("/follow/:id").get(auth, followandUnfollowUser);

router.route("/update/password").put(auth, updatePassword);

router.route("/update/profile").put(auth, updateProfile);

router.route("/update/profile").put(auth, updateProfile);

router.route("/delete/me").delete(auth, deleteMyProfile);

router.route("/me").get(auth, myProfile);

router.route("/user/:id").get(auth, getUserProfile);

router.route("/users").get(auth, getAllUsers);

router.route("/forgot/password").post(forgotPassword);

router.route("/password/reset/:token").put(resetPassword);

module.exports = router;
