import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Container,
  Card,
  Spinner,
  Alert,
  Row,
  Col,
  Form,
  Button,
  Badge,
  ButtonGroup,
  Modal,
  Image,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const UserOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    page: 1
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1
  });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    product_id: "",
    product_name: "",
    product_image: "",
    order_id: "",
    rating: 5,
    comment: ""
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  const navigate = useNavigate();
  const ordersPerPage = 10;

  // Cải thiện cách lấy userId
  const getUserId = () => {
    return localStorage.getItem("user_id") ||
      localStorage.getItem("id") ||
      JSON.parse(localStorage.getItem("user") || "{}")?.id ||
      null;
  };

  const userId = getUserId();

  const statusOptions = [
    { value: "", label: "Tất cả trạng thái" },
    { value: "pending", label: "Chờ xử lý" },
    { value: "shipped", label: "Đã gửi hàng" },
    { value: "delivered", label: "Đã giao" },
    { value: "cancelled", label: "Đã hủy" }
  ];

  const statusColors = {
    pending: "warning",
    shipped: "primary",
    delivered: "success",
    cancelled: "danger"
  };

  const statusLabels = {
    pending: "Chờ xử lý",
    shipped: "Đã gửi hàng",
    delivered: "Đã giao",
    cancelled: "Đã hủy"
  };

  const statusIcons = {
    pending: "fas fa-clock",
    shipped: "fas fa-truck",
    delivered: "fas fa-check-circle",
    cancelled: "fas fa-times-circle"
  };

  // Sử dụng useCallback để tránh re-create function
  const fetchOrders = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError("");

      const res = await axios.get("http://localhost:9999/orders");

      console.log("Fetched orders:", res);

      const userOrders = (res.data || []).filter(order =>
        order.user_id === userId || order.user_id?._id === userId
      );

      const ordersWithReviewStatus = await Promise.all(
        userOrders.map(async (order) => {
          if (order.status === 'delivered') {
            const itemsWithReviewStatus = await Promise.all(
              (order.items || []).map(async (item) => {
                try {
                  const reviewCheck = await axios.get(
                    `http://localhost:9999/reviews/check/${userId}/${item.product_id?._id || item.product_id}`
                  );
                  return {
                    ...item,
                    hasReviewed: reviewCheck.data.hasReviewed || false
                  };
                } catch (err) {
                  return {
                    ...item,
                    hasReviewed: false
                  };
                }
              })
            );


            console.log("Items with review status:", itemsWithReviewStatus);

            return {
              ...order,
              items: itemsWithReviewStatus
            };
          }

          return order;
        })
      );

      setAllOrders(ordersWithReviewStatus);

    } catch (err) {
      console.error("Fetch orders error:", err);
      const errorMessage = err.response?.data?.message || "Không thể tải lịch sử đơn hàng.";
      setError(errorMessage);

      if (err.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [userId, navigate]); // Thêm dependencies

  // Áp dụng bộ lọc phía frontend
  const applyFilters = useCallback(() => {
    let filtered = [...allOrders];

    if (filters.status) {
      filtered = filtered.filter(order => order.status === filters.status);
    }

    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const total = filtered.length;
    const totalPages = Math.ceil(total / ordersPerPage);
    const startIndex = (filters.page - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const paginatedOrders = filtered.slice(startIndex, endIndex);

    setOrders(paginatedOrders);
    setPagination({
      total,
      totalPages,
      currentPage: filters.page
    });
  }, [allOrders, filters.status, filters.page, ordersPerPage]); // Thêm dependencies

  useEffect(() => {
    console.log("🔍 Debug localStorage:");
    console.log("user_id:", localStorage.getItem("user_id"));
    console.log("id:", localStorage.getItem("id"));
    console.log("user:", localStorage.getItem("user"));
    console.log("token:", localStorage.getItem("token"));
    console.log("Detected userId:", userId);

    if (!userId) {
      console.log("Không tìm thấy user_id, chuyển về login");
      toast.error("Vui lòng đăng nhập để xem lịch sử đơn hàng");
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [userId, fetchOrders, navigate]); // Thêm fetchOrders và navigate

  // Áp dụng filter khi filters thay đổi
  useEffect(() => {
    applyFilters();
  }, [applyFilters]); // Thêm applyFilters

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const openReviewModal = (product, orderId) => {
    const productImage = product.product_id?.images && Array.isArray(product.product_id.images)
      ? product.product_id.images[0]
      : (product.product_id?.images || "");

    setReviewData({
      product_id: product.product_id?._id || product.product_id,
      product_name: product.product_id?.name || "Sản phẩm",
      product_image: productImage,
      order_id: orderId,
      rating: 5,
      comment: ""
    });
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!reviewData.comment.trim()) {
      toast.error("Vui lòng nhập nhận xét về sản phẩm!");
      return;
    }

    if (reviewData.comment.trim().length < 10) {
      toast.error("Nhận xét phải có ít nhất 10 ký tự!");
      return;
    }

    try {
      setSubmittingReview(true);

      const reviewPayload = {
        user_id: userId,
        product_id: reviewData.product_id,
        rating: parseInt(reviewData.rating),
        comment: reviewData.comment.trim()
      };

      await axios.post("http://localhost:9999/reviews", reviewPayload);

      setShowReviewModal(false);
      toast.success("Đánh giá sản phẩm thành công! Cảm ơn bạn đã chia sẻ.");

      setReviewData({
        product_id: "",
        product_name: "",
        product_image: "",
        order_id: "",
        rating: 5,
        comment: ""
      });

      await fetchOrders();

    } catch (err) {
      console.error("Review submission error:", err);
      const errorMessage = err.response?.data?.message || "Lỗi khi gửi đánh giá. Vui lòng thử lại!";
      toast.error(errorMessage);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Phần còn lại của component giữ nguyên...
  const renderStarRating = (rating, onRatingChange, readonly = false) => {
    return (
      <div className="d-flex align-items-center justify-content-center mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <Button
            key={star}
            variant="link"
            className="p-1 me-1"
            style={{
              fontSize: '32px',
              color: star <= rating ? '#ffc107' : '#e4e5e9',
              textDecoration: 'none',
              lineHeight: 1,
              cursor: readonly ? 'default' : 'pointer',
              textShadow: star <= rating ? '0 0 5px rgba(255, 193, 7, 0.5)' : 'none'
            }}
            onClick={() => !readonly && onRatingChange(star)}
            disabled={readonly}
          >
            ★
          </Button>
        ))}
        <div className="ms-3 text-center">
          <div className="fw-bold text-warning fs-5">{rating}/5</div>
          <small className="text-muted">
            {rating === 5 ? 'Tuyệt vời' :
              rating === 4 ? 'Hài lòng' :
                rating === 3 ? 'Bình thường' :
                  rating === 2 ? 'Không hài lòng' : 'Rất tệ'}
          </small>
        </div>
      </div>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    const pad = (num) => num.toString().padStart(2, '0');

    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();

    return `${hours}:${minutes} ${day}/${month}/${year}`;
  };

  // Phần render JSX giữ nguyên...
  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" size="lg" />
          <h4 className="mt-3">Đang tải lịch sử đơn hàng...</h4>
          <p className="text-muted">Vui lòng chờ trong giây lát</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger" className="text-center">
          <Alert.Heading>
            <i className="fas fa-exclamation-triangle me-2"></i>
            Có lỗi xảy ra!
          </Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex gap-2 justify-content-center">
            <Button variant="outline-danger" onClick={() => window.location.reload()}>
              <i className="fas fa-redo me-1"></i>
              Thử lại
            </Button>
            <Button variant="outline-primary" onClick={() => navigate("/")}>
              <i className="fas fa-home me-1"></i>
              Về trang chủ
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="mb-0 fw-bold text-primary">
          <i className="fas fa-shopping-bag me-2"></i>
          Lịch sử mua hàng
        </h3>
        <Badge bg="info" className="fs-6 px-3 py-2">
          Tổng: {pagination.total} đơn hàng
        </Badge>
      </div>

      {/* Filters */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body className="bg-light rounded-3 py-3">
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold text-dark mb-2 d-block">
                  <i className="fas fa-filter me-2"></i>
                  Lọc theo trạng thái
                </Form.Label>
                <ButtonGroup>
                  {statusOptions.map(option => (
                    <Button
                      key={option.value}
                      variant={filters.status === option.value ? "primary" : "outline-primary"}
                      onClick={() => handleFilterChange('status', option.value)}
                      className="px-3"
                    >
                      {option.label}
                    </Button>
                  ))}
                </ButtonGroup>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Orders */}
      {orders.length === 0 ? (
        <Alert variant="light" className="text-center py-5 border-0 shadow-sm">
          <i className="fas fa-shopping-cart fa-3x mb-3 text-muted"></i>
          <h4 className="fw-bold mb-3">
            {allOrders.length === 0
              ? "Bạn chưa có đơn hàng nào"
              : "Không tìm thấy đơn hàng phù hợp"
            }
          </h4>
          <p className="text-muted">
            {allOrders.length === 0
              ? "Khám phá các sản phẩm hấp dẫn của chúng tôi!"
              : "Thử thay đổi bộ lọc để tìm kiếm đơn hàng khác"
            }
          </p>
          {allOrders.length === 0 && (
            <Button variant="primary" size="lg" onClick={() => navigate("/products")}>
              <i className="fas fa-shopping-bag me-2"></i>
              Mua sắm ngay
            </Button>
          )}
        </Alert>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <Card key={order._id} className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-white border-bottom-0">
                <Row className="align-items-center">
                  <Col md={8}>
                    <div className="d-flex align-items-center">
                      <i className="fas fa-receipt me-2 text-primary fs-4"></i>
                      <div>
                        <span className="fw-bold fs-5 me-3">#{order._id?.slice(-8).toUpperCase()}</span>
                        <Badge
                          bg={statusColors[order.status]}
                          className="px-3 py-1"
                          style={{ fontSize: '0.95rem' }}
                        >
                          <i className={`${statusIcons[order.status]} me-1`}></i>
                          {statusLabels[order.status]}
                        </Badge>
                      </div>
                    </div>
                  </Col>
                  <Col md={4} className="text-end">
                    <span className="fs-5 fw-bold text-danger">{formatCurrency(order.total_amount)}</span>
                    <div className="small text-muted">Tổng tiền</div>
                  </Col>
                </Row>
                <Row className="mt-2 text-muted small">
                  <Col md={8}>
                    <i className="fas fa-calendar-alt me-1"></i>
                    {formatDate(order.created_at)}
                    <span className="mx-3">|</span>
                    <i className="fas fa-credit-card me-1"></i>
                    {order.payment_method === 'COD' ? 'Thanh toán khi nhận hàng' : order.payment_method}
                  </Col>
                  <Col md={4} className="text-end">
                    <i className="fas fa-map-marker-alt me-1"></i>
                    {order.shipping_address || "Không có thông tin"}
                  </Col>
                </Row>
              </Card.Header>
              <Card.Body className="p-0">
                {(order.items || []).map((item, idx) => (
                  <Row key={idx} className="align-items-center px-4 py-3 border-bottom">
                    <Col xs={2}>
                      <Image
                        src={
                          item.product_id?.images && Array.isArray(item.product_id.images)
                            ? item.product_id.images[0]
                            : (item.product_id?.images || " ")
                        }
                        alt={item.product_id?.name || "Sản phẩm"}
                        width={80}
                        height={80}
                        className="rounded shadow-sm"
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = " ";
                        }}
                      />
                      <Badge
                        bg="primary"
                        className="position-absolute top-0 start-100 translate-middle"
                        style={{ fontSize: '0.7rem' }}
                      >
                        {item.quantity}
                      </Badge>
                    </Col>
                    <Col xs={6}>
                      <div className="fw-semibold text-primary mb-1">{item.product_id?.name || "Sản phẩm đã xóa"}</div>
                      <div className="text-muted small">
                        <i className="fas fa-tag me-1"></i>
                        Đơn giá: <span className="fw-bold">{formatCurrency(item.price)}</span>
                      </div>
                    </Col>
                    <Col xs={2} className="text-center">
                      <div className="text-danger fw-bold">{formatCurrency(item.price * item.quantity)}</div>
                      <small className="text-muted">Thành tiền</small>
                    </Col>
                    <Col xs={2} className="text-end">
                      {order.status === 'delivered' && item.product_id?._id && (
                        !item.hasReviewed ? (
                          <Button
                            size="sm"
                            variant="warning"
                            onClick={() => openReviewModal(item, order._id)}
                            className="shadow-sm"
                          >
                            <i className="fas fa-star me-1"></i>
                            Đánh giá
                          </Button>
                        ) : (
                          <Badge bg="success">
                            <i className="fas fa-check-circle me-1"></i>
                            Đã đánh giá
                          </Badge>
                        )
                      )}
                      {order.status !== 'delivered' && (
                        <small className="text-muted">
                          <i className="fas fa-info-circle me-1"></i>
                          Đánh giá sau khi nhận hàng
                        </small>
                      )}
                    </Col>
                  </Row>
                ))}
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Modal đánh giá */}
      <Modal
        show={showReviewModal}
        onHide={() => setShowReviewModal(false)}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="bg-warning text-dark">
          <Modal.Title>
            <i className="fas fa-star me-2"></i>
            Đánh giá sản phẩm
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {reviewData.product_name && (
            <>
              <div className="text-center mb-4 p-3 bg-light rounded">
                {reviewData.product_image && (
                  <Image
                    src={reviewData.product_image}
                    alt={reviewData.product_name}
                    width={80}
                    height={80}
                    className="rounded shadow-sm mb-2"
                    style={{ objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = " ";
                    }}
                  />
                )}
                <h5 className="text-primary mb-1">{reviewData.product_name}</h5>
                <small className="text-muted">Chia sẻ trải nghiệm của bạn về sản phẩm này</small>
              </div>
              {/* Rating */}
              <div className="mb-4 text-center">
                <Form.Label className="fw-bold mb-2 d-block">
                  <i className="fas fa-star me-2 text-warning"></i>
                  Đánh giá của bạn
                </Form.Label>
                {renderStarRating(reviewData.rating, (rating) =>
                  setReviewData(prev => ({ ...prev, rating }))
                )}
              </div>
              {/* Comment */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">
                  <i className="fas fa-comment me-2 text-info"></i>
                  Nhận xét chi tiết
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={reviewData.comment}
                  onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Cảm nhận về sản phẩm... (tối thiểu 10 ký tự)"
                  className="shadow-sm"
                  style={{ resize: 'vertical', minHeight: '100px' }}
                />
                <Form.Text className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  {reviewData.comment.length}/500 ký tự
                </Form.Text>
              </Form.Group>
              {/* Gợi ý */}
              <Alert variant="info" className="mb-0">
                <Alert.Heading className="h6">
                  <i className="fas fa-lightbulb me-2"></i>
                  Gợi ý đánh giá
                </Alert.Heading>
                <ul className="mb-0 small ps-3">
                  <li>Chất lượng sản phẩm</li>
                  <li>Dịch vụ giao hàng</li>
                  <li>So sánh với kỳ vọng</li>
                  <li>Lời khuyên cho người mua khác</li>
                </ul>
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <Button
            variant="outline-secondary"
            onClick={() => setShowReviewModal(false)}
            disabled={submittingReview}
          >
            <i className="fas fa-times me-1"></i>
            Hủy
          </Button>
          <Button
            variant="warning"
            onClick={submitReview}
            disabled={submittingReview || !reviewData.comment.trim() || reviewData.comment.trim().length < 10}
            className="px-4"
          >
            {submittingReview ? (
              <>
                <Spinner size="sm" className="me-2" />
                Đang gửi...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane me-2"></i>
                Gửi đánh giá
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserOrderHistory;
