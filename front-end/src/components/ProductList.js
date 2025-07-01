import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Form,
  Pagination,
} from "react-bootstrap";
import { Link } from "react-router-dom";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1) Load dữ liệu ban đầu
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [prodRes, catRes] = await Promise.all([
          axios.get("http://localhost:9999/products"),
          axios.get("http://localhost:9999/categories"),
        ]);
        setProducts(prodRes.data.products);
        setCategories(catRes.data);
      } catch (err) {
        setError("Không thể tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filtered = products.filter((p) => {
    const matchName = p.name
      .toLowerCase()
      .includes(searchTerm.trim().toLowerCase());
    const prodCatId =
      p.categories && typeof p.categories === "object"
        ? p.categories._id
        : p.categories;

    const matchCat = !selectedCategory || prodCatId === selectedCategory;

    return matchName && matchCat;
  });

  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentDisplay = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / productsPerPage);

  const onSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };
  const onCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p>Đang tải...</p>
      </div>
    );
  }
  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Container className="py-5">
      <h2 className="text-center text-pink mb-4">Danh sách sản phẩm</h2>

      {/* Search & Filter */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Control
            type="text"
            placeholder="Gõ tên sản phẩm..."
            value={searchTerm}
            onChange={onSearchChange}
          />
        </Col>
        <Col md={4}>
          <Form.Select value={selectedCategory} onChange={onCategoryChange}>
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {/* Product Grid */}
      <Row className="g-4">
        {currentDisplay.length === 0 && (
          <Col>
            <p className="text-center text-muted">Không tìm thấy sản phẩm.</p>
          </Col>
        )}
        {currentDisplay.map((p) => (
          <Col key={p._id} xs={12} sm={6} md={4} lg={3}>
            <Card className="h-100 text-center shadow-sm">
              <Card.Img
                variant="top"
                src={p.images?.[0] || "https://via.placeholder.com/300"}
                style={{ height: "100%", objectFit: "cover" }}
              />
              <Card.Body className="d-flex flex-column justify-content-center">
                <Card.Title className="fw-bold">{p.name}</Card.Title>
                <Card.Text className="text-danger fw-bold">
                  {p.price.toLocaleString("vi-VN")}₫
                </Card.Text>
                <Card.Text>
                  <span className="badge bg-secondary me-2">
                    Tồn kho: {p.stock}
                  </span>
                  <span
                    className={`badge ${p.is_available ? "bg-success" : "bg-danger"
                      }`}
                  >
                    {p.is_available ? "Còn hàng" : "Hết hàng"}
                  </span>
                </Card.Text>
                <Link
                  to={`/products/${p._id}`}
                  className="btn btn-outline-primary mt-2"
                >
                  Xem chi tiết
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination>
            {[...Array(totalPages)].map((_, idx) => (
              <Pagination.Item
                key={idx + 1}
                active={currentPage === idx + 1}
                onClick={() => setCurrentPage(idx + 1)}
              >
                {idx + 1}
              </Pagination.Item>
            ))}
          </Pagination>
        </div>
      )}
    </Container>
  );
};

export default ProductList;
