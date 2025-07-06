// src/middleware/auth.middleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config(); // Đảm bảo nạp biến môi trường

const SECRET_KEY = process.env.SECRET_KEY || "your_default_secret";

const verifyToken = (req, res, next) => {
    // Lấy token từ header 'Authorization'
    const authHeader = req.headers['authorization'];
    
    // Token thường có dạng "Bearer [token]"
    // Tách lấy phần token bằng cách split
    const token = authHeader && authHeader.split(' ')[1];

    // Nếu không có token, từ chối truy cập
    if (token == null) {
        return res.status(401).json({ message: "Yêu cầu không chứa token xác thực." });
    }

    // Xác thực token
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            // Nếu có lỗi (ví dụ: token sai, hết hạn), trả về lỗi 403
            console.error("Lỗi xác thực token:", err.message);
            return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
        }

        // Nếu token hợp lệ, lưu thông tin user (payload) vào request
        // để các hàm xử lý sau có thể sử dụng
        req.user = user;
        next(); // Cho phép đi tiếp đến route cần truy cập
    });
};

module.exports = { verifyToken };