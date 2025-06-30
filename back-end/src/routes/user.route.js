const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.post("/register", userController.register);
router.post("/verify-otp", userController.verifyOTP);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/:id", userController.getUserById);
router.get("/profile", verifyToken, (req, res) => {
    res.json({ message: "Bạn đã đăng nhập", user: req.user });
});
router.post("/request-reset-password", userController.requestResetPassword);
router.post("/reset-password", userController.resetPassword);

module.exports = router;