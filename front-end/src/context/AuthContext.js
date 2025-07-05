// contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

// --- Cấu hình Axios Interceptor ---
// Interceptor này sẽ tự động thêm token vào header của mọi request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
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
  // 1. Thêm trạng thái loading, mặc định là true
  const [loading, setLoading] = useState(true);

  // 2. Bọc các hàm trong useCallback
  const login = useCallback(async (token, userData) => {
    // Lưu token ngay khi có
    localStorage.setItem("token", token);
    try {
      // Nếu có sẵn data user (từ form login) thì dùng luôn
      if (userData) {
        setUser(userData);
      } else {
        // Nếu không, gọi API để lấy thông tin user
        const res = await axios.get("/api/me");
        setUser(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      // Nếu có lỗi (vd: token hết hạn), thì đăng xuất
      localStorage.removeItem("token");
      setUser(null);
    }
  }, []); // Dependency rỗng vì hàm không phụ thuộc vào state/props nào

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  const hasPermission = useCallback(
    (permission) => {
      return user?.permissions?.includes(permission) || false;
    },
    [user] // Phụ thuộc vào `user`
  );

  const isRole = useCallback(
    (role) => {
      return user?.role === role;
    },
    [user] // Phụ thuộc vào `user`
  );

  // useEffect để kiểm tra đăng nhập khi app khởi động
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        // Gọi hàm login đã được cải thiện
        await login(token);
      }
      // 3. Sau khi kiểm tra xong, tắt loading
      setLoading(false);
    };

    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần duy nhất

  // Trong khi đang xác thực, có thể hiển thị một màn hình chờ
  if (loading) {
    return <div>Loading...</div>; // Hoặc một component Spinner đẹp hơn
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, logout, hasPermission, isRole }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
export default AuthContext;