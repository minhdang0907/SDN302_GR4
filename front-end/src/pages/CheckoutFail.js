import React from "react";
import { Container, Alert, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const CheckoutFail = () => {
  const navigate = useNavigate();

  return (
    <Container className="text-center py-5">
      <Alert variant="danger">
        <h4>Thanh toán thất bại hoặc bị huỷ.</h4>
        <p>Vui lòng thử lại hoặc chọn phương thức khác.</p>
        <Button variant="primary" onClick={() => navigate("/")}>
          Quay lại trang chủ
        </Button>
      </Alert>
    </Container>
  );
};

export default CheckoutFail;
