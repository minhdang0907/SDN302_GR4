import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Image,
  Button,
  Form,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext'; 


const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voucher, setVoucher] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const navigate = useNavigate();
  const { user } = useAuth(); 
  const userId = user?.id || localStorage.getItem("user_id");

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }
    fetchCart();
  }, [userId]);

  const fetchCart = async () => {
    try {
      const res = await axios.get(`http://localhost:9999/carts/${userId}`);
      setCart(res.data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  };
  const handleCheckout = () => {
    navigate("/checkout", {
      state: {
        discountPercent,
      },
    });
  };

  const updateQuantity = async (product_id, newQty) => {
    if (newQty < 1) return;
    try {
      await axios.put(
        "http://localhost:9999/carts/update",
        {
          user_id: userId,
          product_id,
          quantity: newQty,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      fetchCart();
    } catch (err) {
      alert(err.response?.data?.message || "Cập nhật thất bại");
    }
  };

  const removeItem = async (product_id) => {
    await axios.delete("http://localhost:9999/carts/remove", {
      data: { user_id: userId, product_id },
    });
    fetchCart();
  };

  const clearCart = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xoá toàn bộ giỏ hàng?")) {
      await axios.delete("http://localhost:9999/carts/clear", {
        data: { user_id: userId },
      });
      fetchCart();
    }
  };

  const applyVoucher = async () => {
    try {
      const res = await axios.post("http://localhost:9999/discounts/apply", {
        code: voucher,
      });
      setDiscountPercent(res.data.discount_percent);
      alert(`Đã áp dụng mã: Giảm ${res.data.discount_percent}%`);
    } catch (err) {
      alert(err.response?.data?.message || "Mã giảm giá không hợp lệ.");
      setDiscountPercent(0);
    }
  };

  if (loading) return <div className="text-center py-5">Đang tải...</div>;
  if (!cart || cart.items.length === 0)
    return <Alert variant="info">Giỏ hàng của bạn đang trống.</Alert>;

  const subtotal = cart.items.reduce((total, item) => {
    return total + item.product_id?.price * item.quantity;
  }, 0);
  const discountAmount = subtotal * (discountPercent / 100);
  const total = subtotal - discountAmount ;

  return (
    <Container className="py-4">
      <h3 className="mb-4">Giỏ hàng</h3>

      <div className="border p-3">
        {cart.items.map((item, idx) => (
          <Row key={idx} className="align-items-center mb-3 border-bottom pb-3">
            <Col xs={1}>
              <Button
                variant="link"
                onClick={() => removeItem(item.product_id._id)}
                className="text-danger"
              >
                ×
              </Button>
            </Col>
            <Col xs={2}>
              <Image
                style={{ width: "100px" }}
                src={
                  item.product_id.images[0] || "https://via.placeholder.com/100"
                }
                fluid
              />
            </Col>
            <Col xs={3}>{item.product_id.name}</Col>
            <Col xs={2}>{item.product_id.price.toLocaleString("vi-VN")}₫</Col>
            <Col xs={2} className="d-flex align-items-center">
              <Button
                size="sm"
                variant="light"
                onClick={() =>
                  updateQuantity(item.product_id._id, item.quantity - 1)
                }
              >
                -
              </Button>
              <Form.Control
                value={item.quantity}
                readOnly
                className="mx-2 text-center"
                style={{ width: "50px" }}
              />
              <Button
                size="sm"
                variant="light"
                onClick={() =>
                  updateQuantity(item.product_id._id, item.quantity + 1)
                }
              >
                +
              </Button>
            </Col>
            <Col xs={2}>
              {(item.product_id.price * item.quantity).toLocaleString("vi-VN")}₫
            </Col>
          </Row>
        ))}
      </div>

      <Button
        variant="outline-danger"
        className="w-100 mt-2"
        onClick={clearCart}
      >
        Xoá toàn bộ giỏ hàng
      </Button>

      <Row className="mt-4">
        <Col md={6}>
          <Form className="d-flex">
            <Form.Control
              placeholder="Mã giảm giá"
              value={voucher}
              onChange={(e) => setVoucher(e.target.value)}
            />
            <Button className="ms-2" onClick={applyVoucher}>
              Áp dụng
            </Button>
          </Form>
        </Col>
        <Col md={6}>
          <div className="border p-3 bg-light">
            <p className="d-flex justify-content-between">
              <span>Tạm tính:</span>
              <strong>{subtotal.toLocaleString("vi-VN")}₫</strong>
            </p>
            {discountPercent > 0 && (
              <p className="d-flex justify-content-between text-success">
                <span>Giảm giá ({discountPercent}%):</span>
                <strong>-{discountAmount.toLocaleString("vi-VN")}₫</strong>
              </p>
            )}
            <hr />
            <h5 className="d-flex justify-content-between">
              <span>Tổng cộng:</span>
              <strong>{total.toLocaleString("vi-VN")}₫</strong>
            </h5>
            <Button
              onClick={handleCheckout}
              variant="primary"
              className="w-100 mt-3"
            >
              Thanh toán
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default Cart;
