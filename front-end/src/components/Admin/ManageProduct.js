import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Alert, Row, Col, Pagination } from "react-bootstrap";

function ManageProduct() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [editProduct, setEditProduct] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 8;
  const [addProduct, setAddProduct] = useState({
    name: "",
    price: "",
    stock: "",
    is_available: true,
    description: "",
    categories: "",
  });
  const [showAdd, setShowAdd] = useState(false);

  // Load danh mục
  useEffect(() => {
    axios.get("http://localhost:9999/categories")
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  // Load sản phẩm khi search/filter/page thay đổi
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [search, category, page]);

  const fetchProducts = async () => {
    try {
      const params = {
        search: search || undefined,
        category: category || undefined,
        page,
        limit
      };
      const res = await axios.get("http://localhost:9999/products", { params });
      setProducts(res.data.products || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      setError("Không thể tải sản phẩm");
    }
  };

  // Xóa sản phẩm
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
    try {
      await axios.delete(`http://localhost:9999/products/${id}`);
      setSuccess("Đã xóa sản phẩm!");
      fetchProducts();
    } catch (err) {
      setError("Xóa thất bại");
    }
  };

  // Mở modal sửa
  const handleEdit = (product) => {
    setEditProduct({ ...product });
    setShowEdit(true);
    setError("");
    setSuccess("");
  };

  // Lưu sửa sản phẩm
  const handleSaveEdit = async () => {
    try {
      await axios.put(`http://localhost:9999/products/${editProduct._id}`, editProduct);
      setShowEdit(false);
      setSuccess("Đã cập nhật sản phẩm!");
      fetchProducts();
    } catch (err) {
      setError("Cập nhật thất bại");
    }
  };

  // Thêm sản phẩm mới
  const handleAddProduct = async () => {
    try {
      await axios.post("http://localhost:9999/products", {
        ...addProduct,
        price: Number(addProduct.price),
        stock: Number(addProduct.stock),
      });
      setShowAdd(false);
      setSuccess("Đã thêm sản phẩm mới!");
      setAddProduct({
        name: "",
        price: "",
        stock: "",
        is_available: true,
        description: "",
        categories: "",
      });
      fetchProducts();
    } catch (err) {
      setError("Thêm sản phẩm thất bại");
    }
  };

  // Phân trang
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="container mt-4">
      <h3>Quản lý sản phẩm</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* Nút thêm sản phẩm */}
      <Button className="mb-3" onClick={() => setShowAdd(true)}>
        Thêm sản phẩm
      </Button>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Control
            placeholder="Tìm kiếm theo tên..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
        </Col>
        <Col md={4}>
          <Form.Select
            value={category}
            onChange={e => { setCategory(e.target.value); setPage(1); }}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Tên</th>
            <th>Giá</th>
            <th>Tồn kho</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.price.toLocaleString("vi-VN")}₫</td>
              <td>{p.stock}</td>
              <td>{p.is_available ? "Còn hàng" : "Hết hàng"}</td>
              <td>
                <Button variant="warning" size="sm" onClick={() => handleEdit(p)}>
                  Sửa
                </Button>{" "}
                <Button variant="danger" size="sm" onClick={() => handleDelete(p._id)}>
                  Xóa
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Phân trang */}
      {totalPages > 1 && (
        <Pagination>
          <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
          <Pagination.Prev onClick={() => setPage(page - 1)} disabled={page === 1} />
          {[...Array(totalPages)].map((_, idx) => (
            <Pagination.Item
              key={idx + 1}
              active={page === idx + 1}
              onClick={() => setPage(idx + 1)}
            >
              {idx + 1}
            </Pagination.Item>
          ))}
          <Pagination.Next onClick={() => setPage(page + 1)} disabled={page === totalPages} />
          <Pagination.Last onClick={() => setPage(totalPages)} disabled={page === totalPages} />
        </Pagination>
      )}

      {/* Modal thêm sản phẩm */}
      <Modal show={showAdd} onHide={() => setShowAdd(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Thêm sản phẩm mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên</Form.Label>
              <Form.Control
                type="text"
                value={addProduct.name}
                onChange={e => setAddProduct({ ...addProduct, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Giá</Form.Label>
              <Form.Control
                type="number"
                value={addProduct.price}
                onChange={e => setAddProduct({ ...addProduct, price: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tồn kho</Form.Label>
              <Form.Control
                type="number"
                value={addProduct.stock}
                onChange={e => setAddProduct({ ...addProduct, stock: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Trạng thái</Form.Label>
              <Form.Select
                value={addProduct.is_available ? "1" : "0"}
                onChange={e =>
                  setAddProduct({ ...addProduct, is_available: e.target.value === "1" })
                }
              >
                <option value="1">Còn hàng</option>
                <option value="0">Hết hàng</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                value={addProduct.description}
                onChange={e => setAddProduct({ ...addProduct, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Danh mục</Form.Label>
              <Form.Select
                value={addProduct.categories}
                onChange={e => setAddProduct({ ...addProduct, categories: e.target.value })}
              >
                <option value="">Chọn danh mục</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ảnh (dán nhiều link, cách nhau dấu phẩy)</Form.Label>
              <Form.Control
                type="text"
                value={addProduct.images || ""}
                onChange={e => setAddProduct({ ...addProduct, images: e.target.value })}
                placeholder="https://example.com/1.jpg, https://example.com/2.jpg"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAdd(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleAddProduct}>
            Thêm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal sửa sản phẩm */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Sửa sản phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editProduct && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Tên</Form.Label>
                <Form.Control
                  type="text"
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Giá</Form.Label>
                <Form.Control
                  type="number"
                  value={editProduct.price}
                  onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Tồn kho</Form.Label>
                <Form.Control
                  type="number"
                  value={editProduct.stock}
                  onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Trạng thái</Form.Label>
                <Form.Select
                  value={editProduct.is_available ? "1" : "0"}
                  onChange={(e) =>
                    setEditProduct({ ...editProduct, is_available: e.target.value === "1" })
                  }
                >
                  <option value="1">Còn hàng</option>
                  <option value="0">Hết hàng</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEdit(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSaveEdit}>
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ManageProduct;