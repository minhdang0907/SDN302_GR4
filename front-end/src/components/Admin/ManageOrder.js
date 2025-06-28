import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Table,
  Spinner,
  Alert,
  Badge
} from "react-bootstrap";

const ManageOrder = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get("http://localhost:9999/orders");
        setOrders(res.data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải danh sách đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const renderStatus = (status) => {
    const variantMap = {
      pending: "warning",
      shipped: "info",
      delivered: "success",
      cancelled: "danger"
    };
    return <Badge bg={variantMap[status] || "secondary"}>{status}</Badge>;
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
      <h3 className="mb-4">Quản lý đơn hàng</h3>
      {orders.length === 0 ? (
        <p>Chưa có đơn hàng nào.</p>
      ) : (
        <Table bordered hover responsive>
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Khách hàng</th>
              <th>Email</th>
              <th>Sản phẩm</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Ngày đặt</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order._id}>
                <td>{index + 1}</td>
                <td>{order.user_id?.full_name || "Ẩn danh"}</td>
                <td>{order.user_id?.email || "-"}</td>
                <td>
                  {order.items.map((item, idx) => (
                    <div key={idx}>
                      {item.product_id?.name || "SP đã xóa"} × {item.quantity}
                    </div>
                  ))}
                </td>
                <td>{order.total_amount.toLocaleString("vi-VN")}₫</td>
                <td>{renderStatus(order.status)}</td>
                <td>{new Date(order.created_at).toLocaleDateString("vi-VN")}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default ManageOrder;
