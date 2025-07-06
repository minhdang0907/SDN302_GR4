// src/components/AdminNavbar.js
import React from "react";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaUsers, FaBoxOpen, FaClipboardList, FaTags, FaComments, FaUserCircle, FaSignOutAlt, FaHome } from "react-icons/fa";

const AdminNavbar = () => {
  return (
    <Navbar expand="lg" bg="dark" variant="dark" sticky="top" className="shadow-sm">
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
            <NavDropdown title={<span><FaUserCircle className="me-1" /> Admin</span>} id="admin-nav-dropdown" align="end">
              <NavDropdown.Item as={Link} to="#">
                <FaUserCircle className="me-2" />
                Profile
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/">
                <FaHome className="me-2" />
                Home
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="#">
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
