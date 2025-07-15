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
  Modal,
  Form,
  Pagination
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    total: 0
  });

  const navigate = useNavigate();
  const userId = localStorage.getItem('user_id');

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    fetchMyReviews();
  }, [userId, pagination.currentPage]);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:9999/reviews/user/${userId}?page=${pagination.currentPage}&limit=10`
      );
      
      setReviews(response.data.reviews);
      setPagination({
        currentPage: response.data.page,
        totalPages: response.data.totalPages,
        total: response.data.total
      });
    } catch (err) {
      setError('Không thể tải danh sách đánh giá');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditReview = (review) => {
    setEditingReview({
      ...review,
      newRating: review.rating,
      newComment: review.comment
    });
    setShowEditModal(true);
  };

  const handleUpdateReview = async () => {
    try {
      setSubmitting(true);
      await axios.put(`http://localhost:9999/reviews/${editingReview._id}`, {
        rating: editingReview.newRating,
        comment: editingReview.newComment
      });

      toast.success('Cập nhật đánh giá thành công!');
      setShowEditModal(false);
      setEditingReview(null);
      fetchMyReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi cập nhật đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;

    try {
      await axios.delete(`http://localhost:9999/reviews/${reviewId}`);
      toast.success('Xóa đánh giá thành công!');
      fetchMyReviews();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi xóa đánh giá');
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
        <span className="ms-2 text-muted">({rating}/5)</span>
      </div>
    );
  };

  const renderEditableStars = (rating, onRatingChange) => {
    return (
      <div className="d-flex align-items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Button
            key={star}
            variant="link"
            className="p-0 me-1"
            style={{
              fontSize: '24px',
              color: star <= rating ? '#ffc107' : '#e4e5e9',
              textDecoration: 'none'
            }}
            onClick={() => onRatingChange(star)}
          >
            ★
          </Button>
        ))}
        <span className="ms-2 text-muted">({rating} sao)</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Đang tải đánh giá của bạn...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>
          <i className="fas fa-star me-2 text-warning"></i>
          Đánh giá của bạn
        </h3>
        <Badge bg="info" className="fs-6">
          Tổng: {pagination.total} đánh giá
        </Badge>
      </div>

      {reviews.length === 0 ? (
        <Alert variant="info" className="text-center">
          <i className="fas fa-star fa-3x mb-3 text-muted"></i>
          <h5>Bạn chưa có đánh giá nào</h5>
          <p>Hãy mua sắm và đánh giá sản phẩm để chia sẻ trải nghiệm!</p>
          <Button variant="primary" onClick={() => navigate('/products')}>
            Khám phá sản phẩm
          </Button>
        </Alert>
      ) : (
        <>
          {reviews.map((review) => (
            <Card key={review._id} className="mb-4 shadow-sm">
              <Card.Body>
                <Row>
                  <Col md={2}>
                    <Image
                      src={review.product_id?.images?.[0] || 'https://via.placeholder.com/100'}
                      alt={review.product_id?.name}
                      width={100}
                      height={100}
                      className="rounded shadow-sm"
                      style={{ objectFit: 'cover' }}
                    />
                  </Col>
                  <Col md={7}>
                    <div className="mb-2">
                      <h6 className="text-primary mb-1">
                        {review.product_id?.name || 'Sản phẩm đã xóa'}
                      </h6>
                      {renderStars(review.rating)}
                    </div>
                    
                    <p className="text-muted mb-2" style={{ lineHeight: 1.6 }}>
                      "{review.comment}"
                    </p>
                    
                    <small className="text-muted">
                      <i className="fas fa-clock me-1"></i>
                      Đánh giá vào {new Date(review.created_at).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </small>
                    
                    {review.updated_at !== review.created_at && (
                      <small className="text-info d-block">
                        <i className="fas fa-edit me-1"></i>
                        Đã chỉnh sửa vào {new Date(review.updated_at).toLocaleDateString('vi-VN')}
                      </small>
                    )}
                  </Col>
                  <Col md={3} className="text-end">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2 mb-2"
                      onClick={() => handleEditReview(review)}
                    >
                      <i className="fas fa-edit me-1"></i>
                      Sửa
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="mb-2"
                      onClick={() => handleDeleteReview(review._id)}
                    >
                      <i className="fas fa-trash me-1"></i>
                      Xóa
                    </Button>
                    <div className="mt-2">
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => navigate(`/product/${review.product_id?._id}`)}
                        className="text-decoration-none"
                      >
                        <i className="fas fa-eye me-1"></i>
                        Xem sản phẩm
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center">
              <Pagination>
                <Pagination.First
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: 1 }))}
                  disabled={pagination.currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  disabled={pagination.currentPage === 1}
                />
                
                {[...Array(pagination.totalPages)].map((_, idx) => (
                  <Pagination.Item
                    key={idx + 1}
                    active={pagination.currentPage === idx + 1}
                    onClick={() => setPagination(prev => ({ ...prev, currentPage: idx + 1 }))}
                  >
                    {idx + 1}
                  </Pagination.Item>
                ))}
                
                <Pagination.Next
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  disabled={pagination.currentPage === pagination.totalPages}
                />
                <Pagination.Last
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: pagination.totalPages }))}
                  disabled={pagination.currentPage === pagination.totalPages}
                />
              </Pagination>
            </div>
          )}
        </>
      )}

      {/* Edit Review Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <i className="fas fa-edit me-2"></i>
            Chỉnh sửa đánh giá
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {editingReview && (
            <>
              <div className="text-center mb-4">
                <h6 className="text-primary">{editingReview.product_id?.name}</h6>
              </div>
              
              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">
                  <i className="fas fa-star me-2 text-warning"></i>
                  Đánh giá mới
                </Form.Label>
                {renderEditableStars(editingReview.newRating, (rating) =>
                  setEditingReview(prev => ({ ...prev, newRating: rating }))
                )}
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">
                  <i className="fas fa-comment me-2 text-info"></i>
                  Nhận xét mới
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={editingReview.newComment}
                  onChange={(e) => setEditingReview(prev => ({ ...prev, newComment: e.target.value }))}
                  placeholder="Cập nhật nhận xét của bạn..."
                  maxLength={500}
                />
                <Form.Text className="text-muted">
                  {editingReview.newComment.length}/500 ký tự
                </Form.Text>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowEditModal(false)}>
            <i className="fas fa-times me-1"></i>
            Hủy
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdateReview}
            disabled={submitting || !editingReview?.newComment?.trim()}
          >
            {submitting ? (
              <>
                <Spinner size="sm" className="me-2" />
                Đang cập nhật...
              </>
            ) : (
              <>
                <i className="fas fa-save me-1"></i>
                Lưu thay đổi
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyReviews;
