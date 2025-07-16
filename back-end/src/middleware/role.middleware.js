// src/middleware/role.middleware.js

const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        // req.user được tạo từ middleware xác thực token (auth.middleware.js)
        // Middleware này phải được dùng SAU middleware xác thực token
        if (!req.user || !req.user.role) {
            return res.status(403).json({ message: "Không có quyền truy cập (role không tồn tại)" });
        }

        const userRole = req.user.role;

        if (allowedRoles.includes(userRole)) {
            next(); // Role hợp lệ, cho phép đi tiếp
        } else {
            return res.status(403).json({ message: "Forbidden - Bạn không có quyền thực hiện hành động này" });
        }
    };
};

module.exports = checkRole;