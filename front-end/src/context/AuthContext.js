// contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (token, data) => {
    localStorage.setItem("token", token);

    try {
      if (!data) {
        const res = await axios.get("/api/me");
        setUser(res.data);
      } else {
        setUser(data);
      }
    } catch (error) {
      console.error("Failed to fetch user info:", error);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || false;
  };

  const isRole = (role) => {
    return user?.role === role;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !user) {
      login(token);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, hasPermission, isRole }}
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
