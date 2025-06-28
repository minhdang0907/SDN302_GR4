// src/components/AdminNavbar.js
import React from "react";
import { Container, Dropdown, Nav, Navbar, NavDropdown } from "react-bootstrap";
import { Link } from "react-router-dom";

const AdminNavbar = () => {
  return (
    <Navbar collapseOnSelect expand="lg" className="bg-body-tertiary">
      <Container>
        <Navbar.Brand href="#home">Admin Page</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#users">Users</Nav.Link>
            <Nav.Link href="#products">Products</Nav.Link>
            <Nav.Link href="/admin/orders">Order</Nav.Link>
            <Nav.Link href="#categories">Categories</Nav.Link>
            <Nav.Link href="#discounts">Discounts</Nav.Link>
            <Nav.Link href="#reviews">Reviews</Nav.Link>
          </Nav>
          <Nav>
            <NavDropdown title="Admin" id="collapsible-nav-dropdown">
              <NavDropdown.Item href="#action/3.1">Admin</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.2">Logout</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="/">Home</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminNavbar;
