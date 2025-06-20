const jwt = require("jsonwebtoken");
require('dotenv').config();
const SECRET_KEY = process.env.kkk; // Khuyên dùng process.env.SECRET_KEY

exports.verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Không có token, từ chối truy cập" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Gán thông tin user vào request để dùng ở route
    next(); // Cho phép truy cập tiếp
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
};
