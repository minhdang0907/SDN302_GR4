// src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

// ✨ --- CẤU HÌNH AXIOS INTERCEPTOR --- ✨
// Interceptor này sẽ tự động thêm token vào header của mọi request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      // Đảm bảo header Authorization được thiết lập đúng chuẩn "Bearer [token]"
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
// ------------------------------------

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ✨ THÊM CÁC BIẾN TRẠNG THÁI MỚI DỰA TRÊN 'user' ✨
    // isAuthenticated sẽ là true nếu 'user' không phải là null
    const isAuthenticated = user !== null;
    // userRole sẽ là giá trị của user.role, hoặc null nếu user là null
    const userRole = user ? user.role : null;

    const login = useCallback((userData, token) => {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    }, []);

    useEffect(() => {
        const checkLoggedIn = () => {
            try {
                const token = localStorage.getItem("token");
                const userData = localStorage.getItem("user");
                if (token && userData) {
                    setUser(JSON.parse(userData));
                }
            } catch (error) {
                console.error("Failed to parse user data from localStorage:", error);
                logout(); 
            } finally {
                setLoading(false);
            }
        };
        checkLoggedIn();
    }, [logout]);

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, userRole, loading, login, logout }}>
            {!loading && children} {/* Chỉ render children khi không còn loading */}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
