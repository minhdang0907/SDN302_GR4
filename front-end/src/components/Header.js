import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Header = () => {
  const userId = localStorage.getItem("user_id");

  const handleLogout = () => {
    localStorage.removeItem("user_id");
    window.location.href = "/";
  };

  return (
    <Navbar bg="light" expand="lg" sticky="top" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="text-pink fw-bold">
          HoaYeuThuong
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Trang chủ</Nav.Link>
            <Nav.Link as={Link} to="/products">Sản phẩm</Nav.Link>
            <Nav.Link as={Link} to="/about">Giới thiệu</Nav.Link>
            <Nav.Link as={Link} to="/contact">Liên hệ</Nav.Link>
            <Nav.Link as={Link} to="/order-history">Lịch sử mua hàng</Nav.Link>
            <Nav.Link as={Link} to="/my-reviews">Đánh giá của tôi</Nav.Link>
          </Nav>
          <Nav>
            <Nav.Link as={Link} to="/cart">🛒 Giỏ hàng</Nav.Link>
            {userId ? (
              <NavDropdown title="Tài khoản" id="user-dropdown">
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
