import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import 'bootstrap-icons/font/bootstrap-icons.css';

const Footer = () => {
  return (
    <footer className="bg-light text-dark pt-5 pb-4 border-top">
      <Container>
        <Row className="gy-4">

          {/* Logo + Contact + QR + Store */}
          <Col md={4}>
            <img
              src="/logo.png"
              alt="HoaYeuThuong"
              width="180"
              className="mb-3"
            />
            <p className="mb-1">Hotline: 1900 1000</p>
            <p className="mb-3">Email: support@hoayeuthuong.vn</p>

            <div className="d-flex align-items-center gap-2 mb-3">
              <img src="/qr.png" alt="QR Code" width="80" />
              <div>
                <img src="/appstore.png" alt="App Store" width="110" className="mb-2" />
                <img src="/googleplay.png" alt="Google Play" width="110" />
              </div>
            </div>

            <img src="/gov-cert.png" alt="Đã thông báo Bộ Công Thương" width="150" />
          </Col>

          {/* Chính sách */}
          <Col md={3}>
            <h6 className="fw-bold">Chăm sóc khách hàng</h6>
            <ul className="list-unstyled">
              <li><a href="/about" className="text-decoration-none text-dark">Giới thiệu</a></li>
              <li><a href="/contact" className="text-decoration-none text-dark">Liên hệ</a></li>
              <li><a href="/shipping" className="text-decoration-none text-dark">Chính sách vận chuyển</a></li>
              <li><a href="/faq" className="text-decoration-none text-dark">Câu hỏi thường gặp</a></li>
              <li><a href="/payment" className="text-decoration-none text-dark">Hình thức thanh toán</a></li>
              <li><a href="/security" className="text-decoration-none text-dark">Bảo mật thông tin</a></li>
              <li><a href="/refund" className="text-decoration-none text-dark">Chính sách hoàn tiền</a></li>
              <li><a href="/complaint" className="text-decoration-none text-dark">Xử lý khiếu nại</a></li>
              <li><a href="/why-us" className="text-decoration-none text-dark">Tại sao chọn HoaYeuThuong?</a></li>
              <li><a href="/blog" className="text-decoration-none text-dark">Blog</a></li>
            </ul>
          </Col>

          {/* Social */}
          <Col md={2}>
            <h6 className="fw-bold">Theo dõi</h6>
            <ul className="list-unstyled">
              <li><i className="bi bi-facebook me-2"></i>Facebook</li>
              <li><i className="bi bi-twitter me-2"></i>Twitter</li>
              <li><i className="bi bi-instagram me-2"></i>Instagram</li>
              <li><i className="bi bi-linkedin me-2"></i>LinkedIn</li>
              <li><i className="bi bi-youtube me-2"></i>YouTube</li>
            </ul>
          </Col>

          {/* Địa chỉ cửa hàng */}
          <Col md={3}>
            <h6 className="fw-bold">Shop HoaYeuThuong</h6>
            <p><strong>Cửa hàng chính:</strong> 123 Hoa Hồng, Quận 1, TP.HCM</p>
            <p><strong>Cửa hàng TP.HCM:</strong> 99 Trần Hưng Đạo, Quận 5</p>
            <p><strong>Chi nhánh Hà Nội:</strong> 65 Trần Phú, Ba Đình</p>
            <p className="mb-1">CÔNG TY TNHH HOA YÊU THƯƠNG</p>
            <p>Mã số thuế: 0123456789</p>
          </Col>
        </Row>

        <hr className="my-4" />
        <p className="text-center text-muted small mb-0">
          © {new Date().getFullYear()} HoaYeuThuong. All rights reserved.
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
