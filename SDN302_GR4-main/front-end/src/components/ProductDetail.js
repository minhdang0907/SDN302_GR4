import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Carousel,
  Badge,
  Button,
  Spinner,
  Alert,
  Form
} from "react-bootstrap";

const ProductDetail = () => {
  const { id } = useParams();

  const [product, setProduct]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [quantity, setQuantity]   = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:9999/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        setError("Không thể tải thông tin sản phẩm.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      await axios.post("http://localhost:9999/cart", {
        user_id: "USER_ID_HERE", // thay USER_ID_HERE bằng ID thực tế
        items: [{ product_id: id, quantity }]
      });
      alert("Đã thêm vào giỏ hàng!");
    } catch {
      alert("Thêm vào giỏ hàng thất bại.");
    }
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
  if (!product) {
    return null;
  }

  return (
    <Container className="py-5">
      <Row>
        {/* Ảnh sản phẩm */}
        <Col md={6}>
          {product.images && product.images.length > 0 ? (
            <Carousel>
              {product.images.map((url, idx) => (
                <Carousel.Item key={idx}>
                  <img
                    className="d-block w-100"
                    src={url}
                    alt={`${product.name} ${idx + 1}`}
                    style={{  objectFit: "cover" }}
                  />
                </Carousel.Item>
              ))}
            </Carousel>
          ) : (
            <img
              className="img-fluid"
              src="https://via.placeholder.com/600x400"
              alt="No Image"
            />
          )}
        </Col>

        {/* Thông tin sản phẩm */}
        <Col md={6}>
          <h3 className="fw-bold">{product.name}</h3>
          <h4 className="text-danger mb-3">
            {product.price.toLocaleString("vi-VN")}₫
          </h4>

          <div className="mb-3">
            <Badge bg="secondary" className="me-2">
              Tồn kho: {product.stock}
            </Badge>
            <Badge bg={product.is_available ? "success" : "danger"}>
              {product.is_available ? "Còn hàng" : "Hết hàng"}
            </Badge>
          </div>

          <p>{product.description}</p>

          <Form.Group as={Row} className="align-items-center mb-4" controlId="qty">
            <Form.Label column sm="3">Số lượng:</Form.Label>
            <Col sm="3">
              <Form.Control
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, +e.target.value)))}
              />
            </Col>
          </Form.Group>

          <Button
            variant="primary"
            disabled={!product.is_available}
            onClick={handleAddToCart}
          >
            Thêm vào giỏ hàng
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetail;
