import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Header = () => {
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
          </Nav>
          <Nav>
            <Nav.Link as={Link} to="/cart">🛒 Giỏ hàng</Nav.Link>
            <Nav.Link as={Link} to="/login">Đăng nhập</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
