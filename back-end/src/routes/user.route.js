// src/routes/user.router.js
const express = require("express");
const router = express.Router();
const userController = require("../controller/user.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const checkRole = require("../middleware/role.middleware"); 
const User = require('../models/user'); 
// === CÁC ROUTE CÔNG KHAI (KHÔNG CẦN ĐĂNG NHẬP) ===
router.post("/register", userController.register);
router.post("/verify-otp", userController.verifyOTP);
router.post("/login", userController.login);
router.post("/request-reset-password", userController.requestResetPassword);
router.post("/reset-password", userController.resetPassword);
router.post("/logout", userController.logout);


// === CÁC ROUTE CẦN ĐĂNG NHẬP (DÀNH CHO CẢ CUSTOMER VÀ ADMIN) ===
// === ROUTE LẤY THÔNG TIN CÁ NHÂN ===
// Dùng ID từ token để tăng cường bảo mật, không cần client gửi ID lên
router.get("/profile", verifyToken, async (req, res) => {
    try {
        // req.user được đính vào từ middleware verifyToken, chứa id và role
        const userId = req.user.id;
        
        // Dùng ID để tìm thông tin user mới nhất trong DB
        // Dùng .select() để loại bỏ các trường nhạy cảm không cần gửi về front-end
        const userProfile = await User.findById(userId).select("-password -otp -otp_expiry -__v");

        if (!userProfile) {
            return res.status(404).json({ message: "Không tìm thấy người dùng." });
        }

        res.status(200).json({ 
            message: "Lấy thông tin profile thành công", 
            user: userProfile 
        });

    } catch (error) {
        console.error("Lỗi khi lấy profile:", error); // Ghi log lỗi để debug
        res.status(500).json({ message: "Lỗi server" });
    }
});
// Thêm địa chỉ mới (cần đăng nhập)
router.post("/address", verifyToken, userController.addAddress);

// Lấy danh sách địa chỉ của một user (cần đăng nhập)
router.get("/:userId/addresses", verifyToken, userController.getAddresses);


// === CÁC ROUTE CHỈ DÀNH CHO ADMIN ===
// Lấy danh sách tất cả người dùng
router.get("/", verifyToken, checkRole(['admin']), userController.getAllUsers);

// Lấy thông tin một người dùng bất kỳ bằng ID
router.get("/:id", verifyToken, checkRole(['admin']), userController.getUserById);

// Cập nhật thông tin người dùng (chỉ admin được làm)
router.put("/:id", verifyToken, checkRole(['admin']), userController.updateUser);

// Xóa người dùng (chỉ admin được làm)
router.delete("/:id", verifyToken, checkRole(['admin']), userController.deleteUser);


module.exports = router;