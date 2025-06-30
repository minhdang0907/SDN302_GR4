const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");

router.post("/register", userController.register);
router.post("/verify-otp", userController.verifyOTP);
router.post("/request-reset-password", userController.requestResetPassword);
router.post("/reset-password", userController.resetPassword);

module.exports = router;