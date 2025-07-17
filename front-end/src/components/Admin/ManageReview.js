import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageReview = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    fetchAllReviews();
  }, [currentPage]);

  const fetchAllReviews = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:9999/reviews/all?page=${currentPage}&limit=10`);
      setReviews(response.data.reviews);
      setTotalPages(response.data.totalPages);
      setTotalReviews(response.data.totalReviews);
      setError('');
    } catch (err) {
      console.error('Lỗi khi lấy đánh giá:', err);
      setError('Có lỗi xảy ra khi tải đánh giá.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        style={{
          color: index < rating ? '#ffc107' : '#ddd',
          fontSize: '18px',
          marginRight: '2px'
        }}
      >
        ★
      </span>
    ));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <p>Đang tải đánh giá...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h2 style={{ color: '#333', marginBottom: '10px' }}>Quản lý tất cả đánh giá</h2>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Tổng số đánh giá: {totalReviews} | Trang {currentPage}/{totalPages}
        </p>
      </div>

      {error && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px', 
          backgroundColor: '#fee', 
          border: '1px solid #fcc', 
          borderRadius: '5px', 
          color: '#c33',
          marginBottom: '20px'
        }}>
          <p>{error}</p>
        </div>
      )}

      {reviews.length > 0 ? (
        <>
          <div>
            {reviews.map((review) => (
              <div 
                key={review._id} 
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '20px',
                  marginBottom: '20px',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {/* Header */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  marginBottom: '15px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1 }}>
                    {review.product_id?.image && (
                      <img 
                        src={review.product_id.image} 
                        alt={review.product_id.name}
                        style={{
                          width: '60px',
                          height: '60px',
                          objectFit: 'cover',
                          borderRadius: '5px',
                          border: '1px solid #eee'
                        }}
                      />
                    )}
                    <div>
                      <h3 style={{ 
                        margin: '0 0 5px 0', 
                        color: '#333', 
                        fontSize: '16px' 
                      }}>
                        {review.product_id?.name || 'Sản phẩm không xác định'}
                      </h3>
                      <p style={{ 
                        margin: '0 0 5px 0', 
                        color: '#e74c3c', 
                        fontWeight: 'bold' 
                      }}>
                        {review.product_id?.price 
                          ? `${review.product_id.price.toLocaleString('vi-VN')}đ`
                          : 'Giá không có'
                        }
                      </p>
                      <p style={{ 
                        margin: '0', 
                        color: '#666', 
                        fontSize: '14px' 
                      }}>
                        Người đánh giá: {review.user_id?.full_name || 'Không xác định'}
                      </p>
                    </div>
                  </div>
                  <div style={{ color: '#999', fontSize: '12px' }}>
                    {formatDate(review.created_at)}
                  </div>
                </div>

                {/* Content */}
                <div style={{ borderTop: '1px solid #eee', paddingTop: '15px' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '10px', 
                    marginBottom: '10px' 
                  }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {renderStars(review.rating)}
                    </div>
                    <span style={{ color: '#666', fontSize: '14px' }}>
                      ({review.rating}/5)
                    </span>
                  </div>
                  
                  {review.comment && (
                    <div style={{ marginTop: '10px' }}>
                      <p style={{
                        margin: '0',
                        padding: '10px',
                        backgroundColor: '#f8f9fa',
                        borderRadius: '5px',
                        fontStyle: 'italic',
                        color: '#555'
                      }}>
                        "{review.comment}"
                      </p>
                    </div>
                  )}

                  {/* Thông tin user */}
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '8px', 
                    backgroundColor: '#f0f0f0', 
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: '#666'
                  }}>
                    Email: {review.user_id?.email || 'Không có'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              gap: '10px',
              marginTop: '30px'
            }}>
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  backgroundColor: currentPage === 1 ? '#f5f5f5' : '#fff',
                  color: currentPage === 1 ? '#999' : '#333',
                  borderRadius: '4px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                Trước
              </button>
              
              <span style={{ color: '#666' }}>
                Trang {currentPage} / {totalPages}
              </span>
              
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #ddd',
                  backgroundColor: currentPage === totalPages ? '#f5f5f5' : '#fff',
                  color: currentPage === totalPages ? '#999' : '#333',
                  borderRadius: '4px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                }}
              >
                Sau
              </button>
            </div>
          )}
        </>
      ) : (
        !error && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>Chưa có đánh giá nào trong hệ thống.</p>
          </div>
        )
      )}
    </div>
  );
};

export default ManageReview;
