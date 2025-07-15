const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// === AUTH ROUTES ===
router.post('/register', userController.register);
router.post('/verify-otp', userController.verifyOTP);
router.post('/login', userController.login);
router.post('/logout', userController.logout);
router.post('/request-reset-password', userController.requestResetPassword);
router.post('/reset-password', userController.resetPassword);

// === ADDRESS ROUTES ===
router.post('/address', userController.addAddress);
router.get('/:userId/addresses', userController.getAddresses);

// === PROFILE ROUTE ===
router.get('/profile', verifyToken, (req, res) => {
  res.json({ message: "Bạn đã đăng nhập", user: req.user });
});

// === CRUD ROUTES (Đặt các route cụ thể trước route dynamic) ===
router.get('/role/:role', userController.getUsersByRole); // Lấy users theo role

// Basic CRUD routes
router.get('/', userController.getAllUsers);              // Lấy tất cả users
router.post('/', userController.createUser);             // Tạo user mới (admin)
router.get('/:id', userController.getUserById);          // Lấy user theo ID
router.put('/:id', userController.updateUser);           // Cập nhật user
router.delete('/:id', userController.deleteUser);        // Xóa user
// Route debug - xóa khi deploy
router.get('/debug/:email', userController.debugUser);

module.exports = router;
