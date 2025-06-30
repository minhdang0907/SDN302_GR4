import React, { useEffect, useRef } from "react";
import axios from "axios";
import { Container, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const calledRef = useRef(false);

  useEffect(() => {
    const finalizeOrder = async () => {
      if (calledRef.current) return;
      calledRef.current = true;

      try {
        const user_id = localStorage.getItem("user_id");
        const address = localStorage.getItem("checkout_address");
        const rawItems = localStorage.getItem("checkout_items");
        const rawTotal = localStorage.getItem("checkout_total");

        const items = JSON.parse(rawItems);
        const total_amount = parseFloat(rawTotal);

        await axios.post("http://localhost:9999/orders/create", {
          user_id,
          items,
          total_amount,
          shipping_address: address,
          payment_method: "PayOS",
        });

        await axios.delete("http://localhost:9999/carts/clear", {
          data: { user_id },
        });

        localStorage.removeItem("checkout_address");
        localStorage.removeItem("checkout_items");
        localStorage.removeItem("checkout_total");

        setTimeout(() => navigate("/"), 3000);
      } catch (err) {
        console.error("Lỗi tạo đơn hàng:", err.response?.data || err.message);
        // vẫn chuyển hướng sau 3 giây kể cả có lỗi
        setTimeout(() => navigate("/"), 3000);
      }
    };

    finalizeOrder();
  }, [navigate]);

  return (
    <Container className="text-center py-5">
      <Alert variant="success">
        Thanh toán thành công! Đang chuyển hướng...
      </Alert>
    </Container>
  );
};

export default CheckoutSuccess;
