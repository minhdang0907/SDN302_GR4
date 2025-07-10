import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Spinner,
  Card,
} from "react-bootstrap";
import { useAuth } from "../context/AuthContext"; 

const Checkout = () => {
  const { user } = useAuth();           
  const userId = user?.id;              
  const [cart, setCart] = useState(null);
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const location = useLocation();
  const initDiscountPercent = location.state?.discountPercent || 0;
  const [discountPercent] = useState(initDiscountPercent);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      navigate("/login"); 
      return;
    }

    const fetchCart = async () => {
      try {
        const cartRes = await axios.get(`http://localhost:9999/carts/${userId}`);
        setCart(cartRes.data);
      } catch (err) {
        setError("Lỗi khi tải giỏ hàng.");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [userId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!address) {
      setError("Vui lòng nhập địa chỉ giao hàng.");
      return;
    }

    const items = cart.items.map((item) => ({
      product_id: item.product_id._id,
      quantity: Number(item.quantity),
      price: Number(item.product_id.price),
    }));

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.product_id.price * item.quantity,
      0
    );
    const discountAmount = subtotal * (discountPercent / 100);
    const total_amount = subtotal - discountAmount;

    if (paymentMethod === "COD") {
      try {
        await axios.post("http://localhost:9999/orders/create", {
          user_id: userId,
          items,
          total_amount,
          shipping_address: address,
          payment_method: "COD",
        });

        alert("Đặt hàng thành công (COD)!");
        navigate("/");
      } catch (err) {
        setError(err.response?.data?.message || "Không thể tạo đơn hàng.");
      }
    } else if (paymentMethod === "PayOS") {
      try {
        localStorage.setItem("checkout_address", address);
        localStorage.setItem("checkout_discount", discountPercent.toString());
        localStorage.setItem("checkout_items", JSON.stringify(items));
        localStorage.setItem("checkout_total", total_amount.toString());

        const res = await axios.post("http://localhost:9999/payment/payos/create", {
          amount: total_amount,
          description: "Thanh toán đơn hàng",
        });

        if (res.data?.checkoutUrl) {
          window.location.href = res.data.checkoutUrl;
        } else {
          setError("Không lấy được đường dẫn thanh toán từ PayOS.");
        }
      } catch (err) {
        console.error("Lỗi PayOS:", err);
        setError("Không thể tạo thanh toán PayOS.");
      }
    }
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );

  if (!user || !cart)
    return <Alert variant="danger">Không thể tải thông tin người dùng hoặc giỏ hàng.</Alert>;

  const subtotal = cart.items.reduce(
    (sum, item) => sum + item.product_id.price * item.quantity,
    0
  );
  const discountAmount = subtotal * (discountPercent / 100);
  const total_amount = subtotal - discountAmount;

  return (
    <Container className="py-5">
      <h3 className="text-center mb-4 text-primary">Thanh toán đơn hàng</h3>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="p-4 shadow-sm">
        <Form onSubmit={handleSubmit}>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Họ và tên</Form.Label>
                <Form.Control value={user.full_name} disabled />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control value={user.email} disabled />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Số điện thoại</Form.Label>
                <Form.Control value={user.phone} disabled />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Địa chỉ giao hàng</Form.Label>
                <Form.Control
                  placeholder="Nhập địa chỉ chi tiết..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-4">
            <Form.Label>Phương thức thanh toán</Form.Label>
            <div className="d-flex flex-column ps-2">
              <Form.Check
                type="radio"
                label="Thanh toán khi nhận hàng (COD)"
                value="COD"
                checked={paymentMethod === "COD"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <Form.Check
                type="radio"
                label="Thanh toán qua PayOS"
                value="PayOS"
                checked={paymentMethod === "PayOS"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
            </div>
          </Form.Group>

          <h5 className="text-end mb-4">
            Tổng tiền :{" "}
            <span className="text-danger">
              {total_amount.toLocaleString("vi-VN")}₫
            </span>
          </h5>

          <Button type="submit" variant="success" className="w-100">
            Xác nhận thanh toán
          </Button>
        </Form>
      </Card>
    </Container>
  );
};

export default Checkout;
