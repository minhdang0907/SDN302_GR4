// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Giả định bạn có hook useAuth để lấy trạng thái đăng nhập và vai trò

const ProtectedRoute = ({ children, allowedRoles, requireLoggedOut }) => {
    // Lấy thông tin người dùng từ AuthContext.
    // user: đối tượng người dùng (có thể null nếu chưa đăng nhập)
    // isAuthenticated: boolean, true nếu đã đăng nhập
    // userRole: chuỗi vai trò của người dùng ('customer', 'admin',...)
    // loading: boolean, true nếu đang trong quá trình xác thực
    const { user, isAuthenticated, userRole, loading } = useAuth();

    // Để debug: in ra trạng thái hiện tại của ProtectedRoute (có thể bỏ comment để kiểm tra)
    // console.log("ProtectedRoute state:", { user, isAuthenticated, userRole, loading, allowedRoles, requireLoggedOut });

    // Nếu đang trong quá trình xác thực, hiển thị trạng thái tải để tránh nhấp nháy chuyển hướng
    if (loading) {
        return <div>Đang tải...</div>; // Hoặc một component Spinner/Loading khác
    }

    // --- Logic xử lý cho các trang chỉ dành cho người dùng CHƯA đăng nhập (ví dụ: /login, /register) ---
    // Nếu prop 'requireLoggedOut' là true, nghĩa là trang này chỉ dành cho người dùng đã đăng xuất.
    if (requireLoggedOut) {
        if (isAuthenticated) { // Nếu người dùng đã đăng nhập và cố gắng truy cập trang này
            // Chuyển hướng admin về trang admin dashboard của họ
            if (userRole === 'admin') {
                return <Navigate to="/admin" replace />;
            }
            // Chuyển hướng customer về trang chủ
            return <Navigate to="/" replace />;
        }
        // Nếu chưa đăng nhập, cho phép truy cập trang (login/register)
        return children ? children : <Outlet />;
    }

    // --- Logic xử lý cho các trang yêu cầu người dùng ĐÃ đăng nhập ---
    // Nếu người dùng chưa đăng nhập và trang không yêu cầu 'requireLoggedOut'
    if (!isAuthenticated) {
        // Chuyển hướng về trang đăng nhập
        return <Navigate to="/login" replace />;
    }

    // --- Logic kiểm tra vai trò (nếu có 'allowedRoles' được định nghĩa) ---
    // Nếu 'allowedRoles' được cung cấp (ví dụ: ['admin'] hoặc ['customer'])
    if (allowedRoles && allowedRoles.length > 0) {
        // Nếu người dùng không có vai trò hoặc vai trò của họ không nằm trong danh sách 'allowedRoles'
        if (!userRole || !allowedRoles.includes(userRole)) {
            // Chuyển hướng tùy thuộc vào vai trò của người dùng hiện tại
            if (userRole === 'admin') {
                // Admin cố gắng truy cập trang không dành cho admin (ví dụ: trang customer) -> đá về trang admin
                return <Navigate to="/admin" replace />;
            }
            // Customer cố gắng truy cập trang không dành cho customer (ví dụ: trang admin) -> đá về trang chủ
            return <Navigate to="/" replace />;
        }
    }

    // Nếu tất cả các kiểm tra đều hợp lệ (đã đăng nhập, đúng vai trò, không phải trang yêu cầu chưa đăng nhập),
    // cho phép truy cập vào component con hoặc Outlet (nếu là route lồng nhau)
    return children ? children : <Outlet />;
};

export default ProtectedRoute;
