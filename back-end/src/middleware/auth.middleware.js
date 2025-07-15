const jwt = require("jsonwebtoken");

const SECRET_KEY = process.env.SECRET_KEY || "your_default_secret";

exports.verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: "Không có token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

// Middleware kiểm tra role admin
exports.verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Chỉ admin mới có quyền truy cập" });
  }
  next();
};

// Middleware kiểm tra user có quyền truy cập resource của mình
exports.verifyOwnership = (req, res, next) => {
  const userId = req.params.id || req.params.userId;
  if (req.user.role !== 'admin' && req.user.id !== userId) {
    return res.status(403).json({ message: "Không có quyền truy cập" });
  }
  next();
};
