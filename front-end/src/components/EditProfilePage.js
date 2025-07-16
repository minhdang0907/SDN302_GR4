// src/pages/EditProfilePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const EditProfilePage = () => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: ''
    });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { login } = useAuth(); // Dùng để cập nhật lại context sau khi sửa

    // 1. Lấy thông tin người dùng hiện tại để điền vào form
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axios.get('/api/users/profile');
                setFormData({
                    full_name: res.data.user.full_name,
                    email: res.data.user.email,
                    phone: res.data.user.phone,
                });
            } catch (error) {
                toast.error("Không thể tải thông tin để chỉnh sửa.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    // 2. Cập nhật state khi người dùng gõ vào input
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 3. Gửi dữ liệu lên server khi submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.put('/api/users/profile', formData);
            toast.success(res.data.message);

            // Cập nhật lại thông tin user trong AuthContext và localStorage
            const token = localStorage.getItem('token');
            login(res.data.user, token);

            // Điều hướng về trang profile
            navigate('/profile');
        } catch (error) {
            const message = error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.";
            toast.error(message);
        }
    };

    if (loading) {
        return <p className="text-center mt-5">Đang tải...</p>;
    }

    return (
        <div className="container my-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow-sm">
                        <div className="card-body p-4">
                            <h2 className="card-title text-center mb-4">Chỉnh Sửa Thông Tin</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label htmlFor="full_name" className="form-label">Họ và tên</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="full_name"
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label">Email</label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="phone" className="form-label">Số điện thoại</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                    <button type="button" className="btn btn-secondary" onClick={() => navigate('/profile')}>Hủy</button>
                                    <button type="submit" className="btn btn-primary">Lưu thay đổi</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProfilePage;