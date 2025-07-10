// src/components/AdminNavbar.js
import React from "react";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaBoxOpen,
  FaClipboardList,
  FaTags,
  FaComments,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
const AdminNavbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <Navbar
      expand="lg"
      bg="dark"
      variant="dark"
      sticky="top"
      className="shadow-sm"
    >
      <Container>
        <Navbar.Brand as={Link} to="/admin" className="fw-bold text-warning">
          <FaUserCircle className="me-2" />
          Admin Dashboard
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/admin/users">
              <FaUsers className="me-2" />
              Users
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/products">
              <FaBoxOpen className="me-2" />
              Products
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/orders">
              <FaClipboardList className="me-2" />
              Orders
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/categories">
              <FaTags className="me-2" />
              Categories
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/discounts">
              <FaTags className="me-2" />
              Discounts
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/reviews">
              <FaComments className="me-2" />
              Reviews
            </Nav.Link>
          </Nav>

          <Nav>
            <NavDropdown
              title={
                <span>
                  <FaUserCircle className="me-1" /> Admin
                </span>
              }
              id="admin-nav-dropdown"
              align="end"
            >
              <NavDropdown.Item onClick={handleLogout}>
                <FaSignOutAlt className="me-2" />
                Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;
