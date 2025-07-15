import React from "react";
import { Container, Alert, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const CheckoutFail = () => {
  return (
    <Container className="py-5 text-center">
      <Alert variant="danger">
        <Alert.Heading>Thanh toán thất bại!</Alert.Heading>
        <p>Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.</p>
        <hr />
        <div className="d-flex justify-content-center gap-3">
          <Button as={Link} to="/cart" variant="primary">
            Quay lại giỏ hàng
          </Button>
          <Button as={Link} to="/" variant="outline-primary">
            Trang chủ
          </Button>
        </div>
      </Alert>
    </Container>
  );
};

export default CheckoutFail;
