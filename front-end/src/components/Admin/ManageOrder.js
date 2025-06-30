import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Table, Spinner, Alert } from "react-bootstrap";

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
  const updateStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:9999/orders/${orderId}/status`,
        {
          status: newStatus,
        }
      );

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error(err);
      alert("Lỗi khi cập nhật trạng thái đơn hàng.");
    }
  };

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
              <th>SDT</th>
              <th>Email</th>
              <th>Sản phẩm</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Phương thức thanh toán</th>
              <th>Địa chỉ giao hàng</th>
              <th>Ngày đặt</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, index) => (
              <tr key={order._id}>
                <td>{index + 1}</td>
                <td>{order.user_id?.full_name || "Ẩn danh"}</td>
                <td>{order.user_id?.phone || "-"}</td>
                <td>{order.user_id?.email || "-"}</td>
                <td>
                  {order.items.map((item, idx) => (
                    <div key={idx}>
                      {item.product_id?.name || "SP đã xóa"} × {item.quantity}
                    </div>
                  ))}
                </td>
                <td>{order.total_amount.toLocaleString("vi-VN")}₫</td>
                <td>
                  <select
                    className="form-select"
                    value={order.status}
                    onChange={(e) => updateStatus(order._id, e.target.value)}
                  >
                    <option value="pending">Chờ xử lý</option>
                    <option value="shipped">Đã gửi hàng</option>
                    <option value="delivered">Đã giao</option>
                    <option value="cancelled">Đã hủy</option>
                  </select>
                </td>
                <td>{order.payment_method}</td>
                <td>{order.shipping_address}</td>
                <td>
                  {new Date(order.created_at).toLocaleDateString("vi-VN")}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default ManageOrder;
