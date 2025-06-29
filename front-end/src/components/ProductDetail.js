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

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);

  const averageRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        setLoading(true);

        // Lấy sản phẩm
        const productRes = await axios.get(`http://localhost:9999/products/${id}`);
        setProduct(productRes.data);
      } catch (err) {
        setError("Không thể tải thông tin sản phẩm.");
        setLoading(false);
        return;
      }

      try {
        // Lấy đánh giá
        const reviewRes = await axios.get(`http://localhost:9999/reviews/product/${id}`);
        setReviews(reviewRes.data);
      } catch (err) {
        console.warn("Không thể tải đánh giá:", err.message);
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndReviews();
  }, [id]);

  const handleAddToCart = async () => {
  const userId = localStorage.getItem("user_id");

  if (!userId) {
    alert("Vui lòng đăng nhập để thêm vào giỏ hàng.");
    return;
  }

  try {
    await axios.post("http://localhost:9999/carts/add", {
      user_id: userId,
      product_id: id,
      quantity,
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

  if (!product) return null;

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
                    style={{ objectFit: "cover" }}
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

          {/* ⭐ Đánh giá trung bình */}
          {averageRating ? (
            <div className="mb-2">
              <span className="text-warning me-2">
                {"★".repeat(Math.round(averageRating))}
                {"☆".repeat(5 - Math.round(averageRating))}
              </span>
              <small>({averageRating} / 5 từ {reviews.length} đánh giá)</small>
            </div>
          ) : (
            <small className="text-muted d-block mb-2">Chưa có đánh giá</small>
          )}

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
                onChange={(e) =>
                  setQuantity(Math.max(1, Math.min(product.stock, +e.target.value)))
                }
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

      {/* Đánh giá chi tiết */}
      <hr className="my-5" />
      <h4>Đánh giá sản phẩm</h4>

      {reviews.length === 0 ? (
        <p className="text-muted">Chưa có đánh giá nào.</p>
      ) : (
        reviews.map((review, index) => (
          <div key={index} className="mb-4 border-bottom pb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <strong>{review.user_id?.full_name || "Người dùng ẩn danh"}</strong>
              <small className="text-muted">
                {new Date(review.created_at).toLocaleDateString("vi-VN")}
              </small>
            </div>
            <div className="text-warning mb-2">
              {"★".repeat(review.rating)}
              {"☆".repeat(5 - review.rating)}
            </div>
            <p>{review.comment || <em className="text-muted">Không có nội dung.</em>}</p>
          </div>
        ))
      )}
    </Container>
  );
};

export default ProductDetail;
