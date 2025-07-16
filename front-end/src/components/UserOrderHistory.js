import React, { useEffect, useState } from "react";
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
  Pagination,
  Modal,
  Image,
  ProgressBar
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const UserOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
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

  // ✅ Cải thiện cách lấy userId
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
    { value: "processing", label: "Đang xử lý" },
    { value: "shipped", label: "Đã gửi hàng" },
    { value: "delivered", label: "Đã giao" },
    { value: "cancelled", label: "Đã hủy" }
  ];

  const statusColors = {
    pending: "warning",
    processing: "info", 
    shipped: "primary",
    delivered: "success",
    cancelled: "danger"
  };

  const statusLabels = {
    pending: "Chờ xử lý",
    processing: "Đang xử lý",
    shipped: "Đã gửi hàng",
    delivered: "Đã giao",
    cancelled: "Đã hủy"
  };

  const statusIcons = {
    pending: "fas fa-clock",
    processing: "fas fa-cog fa-spin",
    shipped: "fas fa-truck",
    delivered: "fas fa-check-circle",
    cancelled: "fas fa-times-circle"
  };

  useEffect(() => {
    // Debug localStorage
    console.log("🔍 Debug localStorage:");
    console.log("user_id:", localStorage.getItem("user_id"));
    console.log("id:", localStorage.getItem("id"));
    console.log("user:", localStorage.getItem("user"));
    console.log("token:", localStorage.getItem("token"));
    console.log("Detected userId:", userId);

    if (!userId) {
      console.log("❌ Không tìm thấy user_id, chuyển về login");
      toast.error("Vui lòng đăng nhập để xem lịch sử đơn hàng");
      navigate("/login");
      return;
    }
    fetchOrders();
  }, [userId, filters]);

  const fetchOrders = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError("");
      
      const params = new URLSearchParams();
      
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status) params.append('status', filters.status);
      params.append('page', filters.page);
      params.append('limit', '10');

      // ✅ Thử nhiều endpoint khác nhau
      let res;
      try {
        res = await axios.get(`http://localhost:9999/orders/user/${userId}?${params}`);
      } catch (err) {
        // Thử endpoint khác nếu endpoint đầu tiên không hoạt động
        res = await axios.get(`http://localhost:9999/api/orders/user/${userId}?${params}`);
      }
      
      // Kiểm tra trạng thái đánh giá cho từng sản phẩm đã giao
      const ordersWithReviewStatus = await Promise.all(
        (res.data.orders || res.data || []).map(async (order) => {
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
            
            return {
              ...order,
              items: itemsWithReviewStatus
            };
          }
          
          return order;
        })
      );

      setOrders(ordersWithReviewStatus);
      setPagination({
        total: res.data.total || ordersWithReviewStatus.length,
        totalPages: res.data.totalPages || Math.ceil(ordersWithReviewStatus.length / 10),
        currentPage: res.data.page || filters.page
      });
    } catch (err) {
      console.error("Fetch orders error:", err);
      const errorMessage = err.response?.data?.message || "Không thể tải lịch sử đơn hàng.";
      setError(errorMessage);
      
      // Nếu lỗi 401 (Unauthorized), chuyển về login
      if (err.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const openReviewModal = (product, orderId) => {
    setReviewData({
      product_id: product.product_id?._id || product.product_id,
      product_name: product.product_id?.name || "Sản phẩm",
      product_image: product.product_id?.images?.[0] || "",
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
      
      // Reset form
      setReviewData({
        product_id: "",
        product_name: "",
        product_image: "",
        order_id: "",
        rating: 5,
        comment: ""
      });
      
      // Refresh orders để cập nhật trạng thái review
      await fetchOrders();
      
    } catch (err) {
      console.error("Review submission error:", err);
      const errorMessage = err.response?.data?.message || "Lỗi khi gửi đánh giá. Vui lòng thử lại!";
      toast.error(errorMessage);
    } finally {
      setSubmittingReview(false);
    }
  };

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

  const getOrderProgress = (status) => {
    const steps = ['pending', 'processing', 'shipped', 'delivered'];
    const currentStep = steps.indexOf(status);
    const progress = status === 'cancelled' ? 0 : ((currentStep + 1) / steps.length) * 100;
    
    return (
      <div className="mb-2">
        <div className="d-flex justify-content-between mb-1">
          <small className="text-muted">Tiến độ đơn hàng</small>
          <small className="text-muted">{Math.round(progress)}%</small>
        </div>
        <ProgressBar 
          now={progress} 
          variant={status === 'cancelled' ? 'danger' : 'success'}
          style={{ height: '6px' }}
        />
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
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>
          <i className="fas fa-shopping-bag me-2 text-primary"></i>
          Lịch sử mua hàng
        </h3>
        <Badge bg="info" className="fs-6">
          Tổng: {pagination.total} đơn hàng
        </Badge>
      </div>
      
      {/* Filters */}
      <Card className="mb-4 shadow-sm">
        <Card.Header className="bg-light">
          <h6 className="mb-0">
            <i className="fas fa-filter me-2"></i>
            Bộ lọc tìm kiếm
          </h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>
                  <i className="fas fa-calendar-alt me-1"></i>
                  Từ ngày
                </Form.Label>
                <Form.Control
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>
                  <i className="fas fa-calendar-alt me-1"></i>
                  Đến ngày
                </Form.Label>
                <Form.Control
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>
                  <i className="fas fa-list me-1"></i>
                  Trạng thái
                </Form.Label>
                <Form.Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button 
                variant="outline-secondary" 
                onClick={() => setFilters({ startDate: "", endDate: "", status: "", page: 1 })}
                className="w-100"
              >
                <i className="fas fa-eraser me-1"></i>
                Xóa bộ lọc
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Orders */}
      {orders.length === 0 ? (
        <Alert variant="info" className="text-center py-5">
          <i className="fas fa-shopping-cart fa-4x mb-3 text-muted"></i>
          <h4>Bạn chưa có đơn hàng nào</h4>
          <p className="text-muted">Hãy khám phá các sản phẩm tuyệt vời của chúng tôi!</p>
          <Button variant="primary" size="lg" onClick={() => navigate("/products")}>
            <i className="fas fa-shopping-bag me-2"></i>
            Mua sắm ngay
          </Button>
        </Alert>
      ) : (
        <>
          {orders.map((order) => (
            <Card key={order._id} className="mb-4 shadow-sm border-0">
              <Card.Header className="bg-gradient" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <Row className="align-items-center text-white">
                  <Col md={6}>
                    <div className="d-flex align-items-center">
                      <i className="fas fa-receipt me-2 fs-5"></i>
                      <div>
                        <strong className="fs-6">Đơn hàng #{order._id?.slice(-8).toUpperCase()}</strong>
                        <div className="small opacity-75">
                          <i className="fas fa-clock me-1"></i>
                          {formatDate(order.created_at)}
                        </div>
                      </div>
                    </div>
                  </Col>
                  <Col md={6} className="text-end">
                    <Badge 
                      bg={statusColors[order.status]} 
                      className="me-2 px-3 py-2"
                      style={{ fontSize: '0.9rem' }}
                    >
                      <i className={`${statusIcons[order.status]} me-1`}></i>
                      {statusLabels[order.status]}
                    </Badge>
                    <Badge 
                      bg={order.payment_method === 'COD' ? 'secondary' : 'success'}
                      className="px-3 py-2"
                      style={{ fontSize: '0.9rem' }}
                    >
                      <i className="fas fa-credit-card me-1"></i>
                      {order.payment_method === 'COD' ? 'COD' : order.payment_method}
                    </Badge>
                  </Col>
                </Row>
              </Card.Header>
              
              <Card.Body className="p-0">
                {/* Progress Bar */}
                <div className="px-4 pt-3">
                  {getOrderProgress(order.status)}
                </div>

                {/* Order Items */}
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="p-4 border-bottom">
                    <Row className="align-items-center">
                      <Col xs={2}>
                        <div className="position-relative">
                          <Image
                            src={item.product_id?.images?.[0] || "https://via.placeholder.com/100"}
                            alt={item.product_id?.name || "Sản phẩm"}
                            width={100}
                            height={100}
                            className="rounded shadow-sm"
                            style={{ objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/100";
                            }}
                          />
                          <Badge 
                            bg="primary" 
                            className="position-absolute top-0 start-100 translate-middle"
                            style={{ fontSize: '0.7rem' }}
                          >
                            {item.quantity}
                          </Badge>
                        </div>
                      </Col>
                      <Col xs={5}>
                        <h6 className="mb-2 text-primary">
                          {item.product_id?.name || "Sản phẩm đã xóa"}
                        </h6>
                        <div className="text-muted small mb-1">
                          <i className="fas fa-tag me-1"></i>
                          Đơn giá: <span className="fw-bold">{formatCurrency(item.price)}</span>
                        </div>
                        <div className="text-muted small">
                          <i className="fas fa-cube me-1"></i>
                          Số lượng: <span className="fw-bold">{item.quantity}</span>
                        </div>
                      </Col>
                      <Col xs={2} className="text-center">
                        <div className="text-danger fw-bold fs-5">
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                        <small className="text-muted">Thành tiền</small>
                      </Col>
                      <Col xs={3} className="text-end">
                        {order.status === 'delivered' && item.product_id?._id && (
                          <>
                            {!item.hasReviewed ? (
                              <Button
                                size="sm"
                                variant="warning"
                                onClick={() => openReviewModal(item, order._id)}
                                className="d-flex align-items-center mx-auto shadow-sm"
                                style={{ minWidth: '120px' }}
                              >
                                <i className="fas fa-star me-2"></i>
                                Đánh giá
                              </Button>
                            ) : (
                              <div className="text-center">
                                <Badge bg="success" className="d-flex align-items-center justify-content-center py-2">
                                  <i className="fas fa-check-circle me-1"></i>
                                  Đã đánh giá
                                </Badge>
                              </div>
                            )}
                          </>
                        )}
                        {order.status !== 'delivered' && (
                          <small className="text-muted">
                            <i className="fas fa-info-circle me-1"></i>
                            Đánh giá sau khi nhận hàng
                          </small>
                        )}
                      </Col>
                    </Row>
                  </div>
                ))}

                {/* Order Summary */}
                <div className="px-4 py-3 bg-light">
                  <Row className="align-items-center">
                    <Col md={6}>
                      <div className="small text-muted">
                        <i className="fas fa-map-marker-alt me-2"></i>
                        <strong>Địa chỉ giao hàng:</strong>
                        <div className="mt-1">{order.shipping_address || "Không có thông tin"}</div>
                      </div>
                    </Col>
                    <Col md={6} className="text-end">
                      <div className="d-flex justify-content-end align-items-center">
                        <div className="me-4">
                          <small className="text-muted d-block">Tổng cộng</small>
                          <span className="fs-4 fw-bold text-danger">
                            {formatCurrency(order.total_amount)}
                          </span>
                        </div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate(`/order-detail/${order._id}`)}
                        >
                          <i className="fas fa-eye me-1"></i>
                          Chi tiết
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination size="lg">
                <Pagination.First
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                />
                
                {[...Array(pagination.totalPages)].map((_, idx) => {
                  const page = idx + 1;
                  if (
                    page === 1 ||
                    page === pagination.totalPages ||
                    (page >= pagination.currentPage - 2 && page <= pagination.currentPage + 2)
                  ) {
                    return (
                      <Pagination.Item
                        key={page}
                        active={pagination.currentPage === page}
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Pagination.Item>
                    );
                  } else if (
                    page === pagination.currentPage - 3 ||
                    page === pagination.currentPage + 3
                  ) {
                    return <Pagination.Ellipsis key={page} />;
                  }
                  return null;
                })}
                
                <Pagination.Next
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                />
                <Pagination.Last
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={pagination.currentPage === pagination.totalPages}
                />
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Review Modal */}
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
              {/* Product Info */}
              <div className="text-center mb-4 p-3 bg-light rounded">
                {reviewData.product_image && (
                  <Image
                    src={reviewData.product_image}
                    alt={reviewData.product_name}
                    width={100}
                    height={100}
                    className="rounded shadow-sm mb-3"
                    style={{ objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/100";
                    }}
                  />
                )}
                <h5 className="text-primary mb-0">{reviewData.product_name}</h5>
                <small className="text-muted">Hãy chia sẻ trải nghiệm của bạn về sản phẩm này</small>
              </div>
              
              {/* Rating */}
              <div className="mb-4">
                <Form.Label className="fw-bold mb-3 d-block text-center">
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
                  rows={5}
                  value={reviewData.comment}
                  onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này... (tối thiểu 10 ký tự)"
                  maxLength={500}
                  className="shadow-sm"
                />
                <div className="d-flex justify-content-between mt-2">
                  <Form.Text className="text-muted">
                    Tối thiểu 10 ký tự
                  </Form.Text>
                  <Form.Text className={`${reviewData.comment.length > 450 ? 'text-danger' : 'text-muted'}`}>
                    {reviewData.comment.length}/500 ký tự
                  </Form.Text>
                </div>
              </Form.Group>

              {/* Tips */}
              <Alert variant="info" className="mb-0">
                <Alert.Heading className="h6">
                  <i className="fas fa-lightbulb me-2"></i>
                  Gợi ý viết đánh giá hay
                </Alert.Heading>
                <ul className="mb-0 small">
                  <li>Mô tả chất lượng sản phẩm thực tế</li>
                  <li>Chia sẻ trải nghiệm sử dụng</li>
                  <li>So sánh với mong đợi ban đầu</li>
                  <li>Đề cập đến dịch vụ giao hàng</li>
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
            Hủy bỏ
          </Button>
          <Button
            variant="warning"
            onClick={submitReview}
            disabled={submittingReview || !reviewData.comment.trim() || reviewData.comment.trim().length < 10}
            className="px-4"
          >
            {submittingReview ? (
              <>
                <Spinner size="sm" className="me-2" />                Đang gửi...
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

                
