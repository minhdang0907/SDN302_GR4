import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Logout = () => {
  const [fullName, setFullName] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem("full_name");
    if (name) setFullName(name);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    localStorage.removeItem("full_name");
    navigate("/login");
  };

  return (
    <l className="d-flex justify-content-between align-items-center p-3 bg-light">
      <h4>🌾 Samurai App</h4>

      <div>
        {fullName ? (
          <>
            <span className="me-3">👋 Xin chào, {fullName}</span>
            <button onClick={handleLogout} className="btn btn-outline-danger btn-sm">
              Đăng xuất
            </button>
          </>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm">
            Đăng nhập
          </Link>
        )}
      </div>
    </l>
  );
};

export default Logout;
