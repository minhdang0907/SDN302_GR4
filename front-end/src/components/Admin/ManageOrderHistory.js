import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Container, 
  Table, 
  Spinner, 
  Alert, 
  Row, 
  Col, 
  Form, 
  Button,
  Badge,
  Pagination,
  Card
} from "react-bootstrap";

const ManageOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    status: "",
    page: 1
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1
  });

  const statusOptions = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "pending", label: "Chờ xử lý" },
    { value: "shipped", label: "Đã gửi hàng" },
    { value: "delivered", label: "Đã giao" },
    { value: "cancelled", label: "Đã hủy" }
  ];

  const statusColors = {
    pending: "warning",
    shipped: "info", 
    delivered: "success",
    cancelled: "danger"
  };

  const statusLabels = {
    pending: "Chờ xử lý",
    shipped: "Đã gửi hàng", 
    delivered: "Đã giao",
    cancelled: "Đã hủy"
  };

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status) params.append('status', filters.status);
      params.append('page', filters.page);
      params.append('limit', '10');

      const res = await axios.get(`http://localhost:9999/orders?${params}`);
      setOrders(res.data.orders);
      setPagination({
        total: res.data.total,
        totalPages: res.data.totalPages,
        currentPage: res.data.page
      });
    } catch (err) {
      console.error(err);
      setError("Không thể tải danh sách đơn hàng.");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset về trang 1 khi filter
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`http://localhost:9999/orders/${orderId}/status`, {
        status: newStatus,
      });

      setOrders(prev =>
        prev.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật trạng thái đơn hàng.");
    }
  };

  const calculateTotal = () => {
    return orders.reduce((sum, order) => sum + order.total_amount, 0);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Container className="py-4">
      <h3 className="mb-4">Lịch sử đơn hàng</h3>
      
      {/* Filters */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Từ ngày</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Đến ngày</Form.Label>
                <Form.Control
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button 
                variant="secondary" 
                onClick={() => setFilters({ startDate: "", endDate: "", status: "", page: 1 })}
              >
                Xóa bộ lọc
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Statistics */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5>{pagination.total}</h5>
              <small className="text-muted">Tổng đơn hàng</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <h5 className="text-success">{calculateTotal().toLocaleString("vi-VN")}₫</h5>
              <small className="text-muted">Tổng doanh thu</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Orders Table */}
      {orders.length === 0 ? (
        <Alert variant="info">Không có đơn hàng nào.</Alert>
      ) : (
        <>
          <Table bordered hover responsive>
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Phương thức thanh toán</th>
                <th>Ngày đặt</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr key={order._id}>
                  <td>{(pagination.currentPage - 1) * 10 + index + 1}</td>
                  <td>
                    <div>
                      <strong>{order.user_id?.full_name || "Ẩn danh"}</strong>
                      <br />
                      <small className="text-muted">{order.user_id?.email}</small>
                      <br />
                      <small className="text-muted">{order.user_id?.phone}</small>
                    </div>
                  </td>
                  <td>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="mb-1">
                        <small>
                          {item.product_id?.name || "SP đã xóa"} × {item.quantity}
                        </small>
                      </div>
                    ))}
                  </td>
                  <td className="text-end">
                    <strong>{order.total_amount.toLocaleString("vi-VN")}₫</strong>
                  </td>
                  <td>
                    <Badge bg={statusColors[order.status]}>
                      {statusLabels[order.status]}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={order.payment_method === 'COD' ? 'secondary' : 'primary'}>
                      {order.payment_method}
                    </Badge>
                  </td>
                  <td>
                    {new Date(order.created_at).toLocaleDateString("vi-VN")}
                    <br />
                    <small className="text-muted">
                      {new Date(order.created_at).toLocaleTimeString("vi-VN")}
                    </small>
                  </td>
                  <td>
                    <Form.Select
                      size="sm"
                      value={order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                    >
                      <option value="pending">Chờ xử lý</option>
                      <option value="shipped">Đã gửi hàng</option>
                      <option value="delivered">Đã giao</option>
                      <option value="cancelled">Đã hủy</option>
                    </Form.Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center">
              <Pagination>
                <Pagination.First 
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.currentPage === 1}
                />
                <Pagination.Prev 
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                />
                
                {[...Array(pagination.totalPages)].map((_, idx) => (
                  <Pagination.Item
                    key={idx + 1}
                    active={pagination.currentPage === idx + 1}
                    onClick={() => handlePageChange(idx + 1)}
                  >
                    {idx + 1}
                  </Pagination.Item>
                ))}
                
                <Pagination.Next 
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                />
                <Pagination.Last 
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={pagination.currentPage === pagination.totalPages}
                />
              </Pagination>
            </div>
          )}
        </>
      )}
    </Container>
  );
};

export default ManageOrderHistory;
