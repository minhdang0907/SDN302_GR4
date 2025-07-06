// src/components/Profile.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
const Profile = () => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                // Endpoint này đã được bảo vệ bằng token ở back-end
                const response = await axios.get('/api/users/profile');
                setProfileData(response.data.user);
            } catch (err) {
                // Lấy thông báo lỗi từ server nếu có, nếu không thì báo lỗi chung
                const errorMessage = err.response?.data?.message || 'Không thể tải thông tin tài khoản. Vui lòng thử lại.';
                setError(errorMessage);

            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []); // Dependency array rỗng để chỉ chạy 1 lần khi component được mount

    // Xử lý trạng thái loading
    if (loading) {
        return <div className="container mt-5 text-center"><p>Đang tải...</p></div>;
    }

    // Xử lý trạng thái lỗi
    if (error) {
        return <div className="container mt-5 text-center"><p className="text-danger">{error}</p></div>;
    }

    // Nếu không có dữ liệu (trường hợp hiếm)
    if (!profileData) {
        return null;
    }

    // Hiển thị giao diện khi có dữ liệu
    return (
        <div className="container my-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-7">
                    <div className="card shadow-sm">
                        <div className="card-body p-4 p-md-5">
                            <h2 className="card-title text-center mb-4">Thông Tin Tài Khoản</h2>
                            <ul className="list-group list-group-flush">
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    <strong>Họ và tên:</strong>
                                    <span>{profileData.full_name}</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    <strong>Email:</strong>
                                    <span>{profileData.email}</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    <strong>Số điện thoại:</strong>
                                    <span>{profileData.phone}</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    <strong>Vai trò:</strong>
                                    <span className="text-capitalize">{profileData.role}</span>
                                </li>
                                <li className="list-group-item d-flex justify-content-between align-items-center">
                                    <strong>Trạng thái:</strong>
                                    {profileData.is_verified ? (
                                        <span className="badge bg-success">Đã xác thực</span>
                                    ) : (
                                        <span className="badge bg-warning text-dark">Chưa xác thực</span>
                                    )}
                                </li>
                            </ul>
                            <div className="text-center mt-4">
                                <Link to="/profile/edit" className="btn btn-primary">
                                    Chỉnh sửa thông tin
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;