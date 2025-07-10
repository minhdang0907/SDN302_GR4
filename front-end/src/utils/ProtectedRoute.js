// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    // Nếu đang trong quá trình xác thực, chưa có thông tin user, thì chờ
    if (loading) {
        return <div>Loading...</div>; // Hoặc một component Spinner
    }

    // Nếu không có user (chưa đăng nhập)
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Nếu có user nhưng vai trò không được phép
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Nếu là customer cố vào trang admin -> đá về trang chủ
       
        const redirectPath = user.role === 'admin' ? '/admin' : '/';
        return <Navigate to={redirectPath} replace />;
    }

    // Nếu mọi thứ ổn, cho phép truy cập
    return children;
};

export default ProtectedRoute;