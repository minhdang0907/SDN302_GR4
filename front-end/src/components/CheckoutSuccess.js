import React, { useEffect } from "react";
import { Container, Alert, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";

const CheckoutSuccess = () => {
  useEffect(() => {
    const createOrderFromPayOS = async () => {
      try {
        const address = localStorage.getItem("checkout_address");
        const discountPercent = localStorage.getItem("checkout_discount");
        const items = JSON.parse(localStorage.getItem("checkout_items") || "[]");
        const totalAmount = localStorage.getItem("checkout_total");
        const userId = localStorage.getItem("user_id");

        if (address && items.length > 0 && totalAmount && userId) {
          await axios.post("http://localhost:9999/orders/create", {
            user_id: userId,
            items,
            total_amount: Number(totalAmount),
            shipping_address: address,
            payment_method: "PayOS",
          });

          // Xóa dữ liệu tạm
          localStorage.removeItem("checkout_address");
          localStorage.removeItem("checkout_discount");
          localStorage.removeItem("checkout_items");
          localStorage.removeItem("checkout_total");
        }
      } catch (error) {
        console.error("Lỗi khi tạo đơn hàng từ PayOS:", error);
      }
    };

    createOrderFromPayOS();
  }, []);

  return (
    <Container className="py-5 text-center">
      <Alert variant="success">
        <Alert.Heading>Thanh toán thành công!</Alert.Heading>
        <p>Đơn hàng của bạn đã được xử lý thành công.</p>
        <hr />
        <div className="d-flex justify-content-center gap-3">
          <Button as={Link} to="/" variant="primary">
            Tiếp tục mua sắm
          </Button>
          <Button as={Link} to="/order-history" variant="outline-primary">
            Xem lịch sử đơn hàng
          </Button>
        </div>
      </Alert>
    </Container>
  );
};

export default CheckoutSuccess;
