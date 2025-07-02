// src/components/AdminNavbar.js
import React from "react";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";

const AdminNavbar = () => {
  return (
    <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand as={Link} to="/admin">
          Admin Page
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/admin/users">
              Users
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/products">
              Products
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/orders">
              Order
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/categories">
              Categories
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/discounts">
              Discounts
            </Nav.Link>
            <Nav.Link as={Link} to="/admin/reviews">
              Reviews
            </Nav.Link>
          </Nav>
          <Nav>
            <NavDropdown title="Admin" id="collapsible-nav-dropdown">
              <NavDropdown.Item as={Link} to="#action/3.1">
                Admin
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="#action/3.2">
                Logout
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/">
                Home
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;
