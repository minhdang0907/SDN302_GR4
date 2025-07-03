import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Header = () => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:9999/api/users/logout", {}, {
                withCredentials: true
            });
        } catch (error) {
            console.error("API logout call failed, proceeding with client-side logout:", error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            navigate('/login');
        }
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
                            <NavDropdown title={`Xin chào, ${user.fullName}`} id="basic-nav-dropdown">
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