// src/components/Header.js
import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // ✨ 1. Import và sử dụng context

const Header = () => {
    // ✨ 2. Lấy user và hàm logout trực tiếp từ AuthContext, không dùng state riêng nữa
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // ✨ 3. Hàm logout bây giờ chỉ cần gọi hàm từ context và điều hướng
    const handleLogout = () => {
        logout(); // Hàm logout trong context sẽ xử lý việc xóa token và state
        navigate('/login');
    };

    return (
        <Navbar bg="light" expand="lg" sticky="top" className="shadow-sm">
            <Container>
                <Navbar.Brand as={Link} to="/" className="fw-bold">
                    HoaYeuThuong
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="navbar-nav" />
                <Navbar.Collapse id="navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link as={Link} to="/">Trang chủ</Nav.Link>
                        <Nav.Link as={Link} to="/products">Sản phẩm</Nav.Link>
                        <Nav.Link as={Link} to="/about">Giới thiệu</Nav.Link>
                        <Nav.Link as={Link} to="/contact">Liên hệ</Nav.Link>
                    </Nav>
                    <Nav>
                        <Nav.Link as={Link} to="/cart">🛒 Giỏ hàng</Nav.Link>

                        {user ? (
                            // ✨ 4. Sửa lại key cho đúng với dữ liệu từ API (full_name)
                            <NavDropdown title={`Xin chào, ${user.full_name}`} id="user-dropdown">
                                <NavDropdown.Item as={Link} to="/profile">
                                    Thông tin tài khoản
                                </NavDropdown.Item>
                                <NavDropdown.Item as={Link} to="/order-history">
                                    Lịch sử mua hàng
                                </NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={handleLogout}>
                                    Đăng xuất
                                </NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <Nav.Link as={Link} to="/login">Đăng nhập</Nav.Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;