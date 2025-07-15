import React, { useState, useEffect } from 'react';
import {
  Container,
  Card,
  Row,
  Col,
  Image,
  Button,
  Badge,
  Spinner,
  Alert,
  Form,
  Pagination,
  ProgressBar,
  Modal,
  Table
} from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const ManageReview = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    ratingDistribution: {
      5: 0, 4: 0, 3: 0, 2: 0, 1: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    rating: '',
    sortBy: 'newest',
    page: 1
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    total: 0
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  const sortOptions = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'highest', label: 'Đánh giá cao nhất' },
    { value: 'lowest', label: 'Đánh giá thấp nhất' }
  ];

  useEffect(() => {
    fetchProductAndReviews();
  }, [productId, filters]);

  const fetchProductAndReviews = async () => {
    try {
      setLoading(true);
      
      // Fetch product info
      const productRes = await axios.get(`http://localhost:9999/products/${productId}`);
      setProduct(productRes.data);

      // Fetch reviews with filters
      const params = new URLSearchParams();
      if (filters.rating) params.append('rating', filters.rating);
      params.append('sortBy', filters.sortBy);
      params.append('page', filters.page);
      params.append('limit', '10');

      const reviewsRes = await axios.get(
        `http://localhost:9999/reviews/product/${productId}?${params}`
      );
      
      setReviews(reviewsRes.data.reviews);
      setReviewStats(reviewsRes.data.stats);
      setPagination({
        currentPage: reviewsRes.data.page,
        totalPages: reviewsRes.data.totalPages,
        total: reviewsRes.data.total
      });
    } catch (err) {
      setError('Không thể tải đánh giá sản phẩm');
      console.error(err);
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

  const handleDeleteReview = async () => {
    if (!reviewToDelete) return;

    try {
      setDeleting(true);
      await axios.delete(`http://localhost:9999/reviews/${reviewToDelete._id}`);
      
      toast.success('Xóa đánh giá thành công!');
      setShowDeleteModal(false);
      setReviewToDelete(null);
      fetchProductAndReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi xóa đánh giá');
    } finally {
      setDeleting(false);
    }
  };

  const renderStars = (rating, size = '16px') => {
    return (
      <div className="d-flex align-items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <i
            key={star}
            className={`fas fa-star ${star <= rating ? 'text-warning' : 'text-muted'}`}
            style={{ fontSize: size }}
          />
        ))}
      </div>
    );
  };

  const renderRatingDistribution = () => {
    const total = reviewStats.totalReviews;
    if (total === 0) return null;

    return (
      <div className="mb-4">
        <h6 className="mb-3">Phân bố đánh giá</h6>
        {[5, 4, 3, 2, 1].map((star) => {
          const count = reviewStats.ratingDistribution[star] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;
          
          return (
            <Row key={star} className="align-items-center mb-2">
              <Col xs={2}>
                <small className="d-flex align-items-center">
                  {star} <i className="fas fa-star text-warning ms-1" style={{ fontSize: '12px' }} />
                </small>
              </Col>
              <Col xs={7}>
                <ProgressBar
                  now={percentage}
                  variant={star >= 4 ? 'success' : star >= 3 ? 'warning' : 'danger'}
                  style={{ height: '8px' }}
                />
              </Col>
              <Col xs={3} className="text-end">
                <small className="text-muted">{count} ({percentage.toFixed(1)}%)</small>
              </Col>
            </Row>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Đang tải đánh giá sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>
          <i className="fas fa-star me-2 text-warning"></i>
          Quản lý đánh giá sản phẩm
        </h3>
        <Button variant="outline-secondary" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left me-2"></i>
          Quay lại
        </Button>
      </div>

      {/* Product Header */}
      {product && (
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Row className="align-items-center">
              <Col md={2}>
                <Image
                  src={product.images?.[0] || 'https://via.placeholder.com/120'}
                  alt={product.name}
                  width={120}
                  height={120}
                  className="rounded shadow-sm"
                  style={{ objectFit: 'cover' }}
                />
              </Col>
              <Col md={7}>
                <h4 className="text-primary mb-2">{product.name}</h4>
                <div className="d-flex align-items-center mb-2">
                  {renderStars(reviewStats.averageRating, '20px')}
                  <span className="ms-2 fw-bold text-warning fs-5">
                    {reviewStats.averageRating.toFixed(1)}
                  </span>
                  <span className="ms-2 text-muted">
                    ({reviewStats.totalReviews} đánh giá)
                  </span>
                </div>
                <Badge bg="info" className="me-2">
                  Danh mục: {product.category}
                </Badge>
                <Badge bg="success">
                  Giá: {product.price?.toLocaleString('vi-VN')}₫
                </Badge>
              </Col>
              <Col md={3} className="text-end">
                <Button
                  variant="outline-primary"
                  onClick={() => navigate(`/product/${productId}`)}
                  className="mb-2 w-100"
                >
                  <i className="fas fa-eye me-2"></i>
                  Xem sản phẩm
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      <Row>
        {/* Left Sidebar - Stats & Filters */}
        <Col md={3}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="bg-light">
              <h6 className="mb-0">
                <i className="fas fa-chart-bar me-2"></i>
                Thống kê đánh giá
              </h6>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-3">
                <div className="display-4 text-warning fw-bold">
                  {reviewStats.averageRating.toFixed(1)}
                </div>
                {renderStars(reviewStats.averageRating, '18px')}
                <div className="text-muted mt-1">
                  {reviewStats.totalReviews} đánh giá
                </div>
              </div>
              
              {renderRatingDistribution()}
            </Card.Body>
          </Card>

          {/* Filters */}
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h6 className="mb-0">
                <i className="fas fa-filter me-2"></i>
                Bộ lọc
              </h6>
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Lọc theo sao</Form.Label>
                <Form.Select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                >
                  <option value="">Tất cả</option>
                  <option value="5">5 sao</option>
                  <option value="4">4 sao</option>
                  <option value="3">3 sao</option>
                  <option value="2">2 sao</option>
                  <option value="1">1 sao</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Sắp xếp theo</Form.Label>
                <Form.Select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => setFilters({ rating: '', sortBy: 'newest', page: 1 })}
              >
                <i className="fas fa-eraser me-1"></i>
                Xóa bộ lọc
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Content - Reviews */}
        <Col md={9}>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5>
              <i className="fas fa-comments me-2"></i>
              Danh sách đánh giá ({pagination.total})
            </h5>
          </div>

          {reviews.length === 0 ? (
            <Alert variant="info" className="text-center">
              <i className="fas fa-comment-slash fa-3x mb-3 text-muted"></i>
              <h6>Chưa có đánh giá nào</h6>
              <p>Sản phẩm này chưa có đánh giá từ khách hàng.</p>
            </Alert>
          ) : (
            <>
              {/* Reviews Table */}
              <Card className="shadow-sm">
                <Table responsive hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Khách hàng</th>
                      <th>Đánh giá</th>
                      <th>Nội dung</th>
                      <th>Ngày tạo</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reviews.map((review) => (
                      <tr key={review._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div
                              className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                              style={{ width: '35px', height: '35px', fontSize: '14px' }}
                            >
                              {review.user_id?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="fw-bold">
                                {review.user_id?.name || 'Người dùng ẩn danh'}
                              </div>
                              <small className="text-muted">
                                {review.user_id?.email}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            {renderStars(review.rating)}
                            <Badge 
                              bg={review.rating >= 4 ? 'success' : review.rating >= 3 ? 'warning' : 'danger'}
                              className="ms-2"
                            >
                              {review.rating}/5
                            </Badge>
                          </div>
                        </td>
                        <td>
                          <div style={{ maxWidth: '300px' }}>
                            <p className="mb-0" style={{ 
                              display: '-webkit-box',
                              WebkitLineClamp: 3,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden'
                            }}>
                              {review.comment}
                            </p>
                          </div>
                        </td>
                        <td>
                          <div>
                            {new Date(review.created_at).toLocaleDateString('vi-VN')}
                          </div>
                          <small className="text-muted">
                            {new Date(review.created_at).toLocaleTimeString('vi-VN')}
                          </small>
                          {review.updated_at !== review.created_at && (
                            <div>
                              <Badge bg="info" className="mt-1">
                                Đã sửa
                              </Badge>
                            </div>
                          )}
                        </td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {
                              setReviewToDelete(review);
                              setShowDeleteModal(true);
                            }}
                          >
                            <i className="fas fa-trash me-1"></i>
                            Xóa
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.First
                      onClick={() => handlePageChange(1)}
                      disabled={pagination.currentPage === 1}
                    />
                    <Pagination.Prev
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage === 1}
                    />
                    
                    {[...Array(pagination.totalPages)].map((_, idx) => (
                      <Pagination.Item
                        key={idx + 1}
                        active={pagination.currentPage === idx + 1}
                        onClick={() => handlePageChange(idx + 1)}
                      >
                        {idx + 1}
                      </Pagination.Item>
                    ))}
                    
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
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>
            <i className="fas fa-exclamation-triangle me-2"></i>
            Xác nhận xóa đánh giá
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reviewToDelete && (
            <div>
              <p><strong>Bạn có chắc chắn muốn xóa đánh giá này?</strong></p>
              <div className="bg-light p-3 rounded">
                <div className="d-flex align-items-center mb-2">
                  <strong>Khách hàng:</strong>
                  <span className="ms-2">{reviewToDelete.user_id?.name}</span>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <strong>Đánh giá:</strong>
                  <div className="ms-2">
                    {renderStars(reviewToDelete.rating)}
                  </div>
                </div>
                <div>
                  <strong>Nội dung:</strong>
                  <p className="mt-1 mb-0 text-muted">"{reviewToDelete.comment}"</p>
                </div>
              </div>
              <Alert variant="warning" className="mt-3 mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Hành động này không thể hoàn tác!
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            <i className="fas fa-times me-1"></i>
            Hủy bỏ
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteReview}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Đang xóa...
              </>
            ) : (
              <>
                <i className="fas fa-trash me-1"></i>
                Xóa đánh giá
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageReview;
