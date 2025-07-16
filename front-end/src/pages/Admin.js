import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from "chart.js";
import axios from "axios";
Chart.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

function Admin() {
  // Demo: số lượng sản phẩm, đơn hàng, người dùng
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0,
  });

  // Lấy dữ liệu thống kê từ backend (bạn cần làm API riêng cho thống kê)
  useEffect(() => {
    axios.get("http://localhost:9999/admin/stats")
      .then(res => setStats(res.data))
      .catch(() => setStats({ products: 0, orders: 0, users: 0, revenue: 0 }));
  }, []);

  // Dữ liệu cho biểu đồ
  const barData = {
    labels: ["Sản phẩm", "Đơn hàng", "Người dùng"],
    datasets: [
      {
        label: "Số lượng",
        data: [stats.products, stats.orders, stats.users],
        backgroundColor: ["#36a2eb", "#ff6384", "#ffce56"],
      },
    ],
  };

  const pieData = {
    labels: ["Sản phẩm", "Đơn hàng", "Người dùng"],
    datasets: [
      {
        data: [stats.products, stats.orders, stats.users],
        backgroundColor: ["#36a2eb", "#ff6384", "#ffce56"],
      },
    ],
  };

  return (
    <Container className="mt-4">
      <h2>Admin Dashboard</h2>
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Thống kê tổng quan</Card.Title>
              <Bar data={barData} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Tỉ lệ</Card.Title>
              <Pie data={pieData} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row xs={1} md={2} lg={3}>
        <Col className="mb-4">
          <Card as={Link} to="/admin/products" className="text-center h-100" style={{ textDecoration: "none" }}>
            <Card.Body>
              <Card.Title>Quản lý sản phẩm</Card.Title>
              <Card.Text>Xem, thêm, sửa, xóa sản phẩm</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col className="mb-4">
          <Card as={Link} to="/admin/categories" className="text-center h-100" style={{ textDecoration: "none" }}>
            <Card.Body>
              <Card.Title>Quản lý danh mục</Card.Title>
              <Card.Text>Xem, thêm, sửa, xóa danh mục</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col className="mb-4">
          <Card as={Link} to="/admin/orders" className="text-center h-100" style={{ textDecoration: "none" }}>
            <Card.Body>
              <Card.Title>Quản lý đơn hàng</Card.Title>
              <Card.Text>Xem và xử lý đơn hàng</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col className="mb-4">
          <Card as={Link} to="/admin/users" className="text-center h-100" style={{ textDecoration: "none" }}>
            <Card.Body>
              <Card.Title>Quản lý người dùng</Card.Title>
              <Card.Text>Xem, sửa, xóa người dùng</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col className="mb-4">
          <Card as={Link} to="/admin/discounts" className="text-center h-100" style={{ textDecoration: "none" }}>
            <Card.Body>
              <Card.Title>Quản lý mã giảm giá</Card.Title>
              <Card.Text>Xem, thêm, sửa, xóa mã giảm giá</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Admin;
