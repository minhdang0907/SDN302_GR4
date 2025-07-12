import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Alert, Row, Col, Pagination, Image } from "react-bootstrap";

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
    images: "",
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

  // Validate dữ liệu sản phẩm
  const validateProduct = (product) => {
    if (!product.name || !product.name.trim()) return "Tên sản phẩm không được để trống";
    if (!product.price || isNaN(product.price) || Number(product.price) <= 0) return "Giá phải là số dương";
    if (product.stock === "" || isNaN(product.stock) || Number(product.stock) < 0) return "Tồn kho phải là số không âm";
    if (!product.categories) return "Vui lòng chọn danh mục";
    let imgs = typeof product.images === "string"
      ? product.images.split(",").map(i => i.trim()).filter(Boolean)
      : Array.isArray(product.images) ? product.images : [];
    if (!imgs.length) return "Vui lòng nhập ít nhất 1 link ảnh";
    if (imgs.some(url => !/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(url))) return "Mỗi link ảnh phải là một URL hợp lệ (jpg, png, ...)";
    return "";
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
    setEditProduct({
      ...product,
      categories: product.categories?._id || product.categories,
      images: Array.isArray(product.images) ? product.images.join(", ") : (product.images || "")
    });
    setShowEdit(true);
    setError("");
    setSuccess("");
  };

  // Lưu sửa sản phẩm
  const handleSaveEdit = async () => {
    const errMsg = validateProduct(editProduct);
    if (errMsg) {
      setError(errMsg);
      return;
    }
    try {
      await axios.put(`http://localhost:9999/products/${editProduct._id}`, {
        ...editProduct,
        price: Number(editProduct.price),
        stock: Number(editProduct.stock),
        images: typeof editProduct.images === "string"
          ? editProduct.images.split(",").map(i => i.trim()).filter(Boolean)
          : editProduct.images,
      });
      setShowEdit(false);
      setSuccess("Đã cập nhật sản phẩm!");
      fetchProducts();
    } catch (err) {
      setError("Cập nhật thất bại");
    }
  };

  // Thêm sản phẩm mới
  const handleAddProduct = async () => {
    const errMsg = validateProduct(addProduct);
    if (errMsg) {
      setError(errMsg);
      return;
    }
    try {
      await axios.post("http://localhost:9999/products", {
        ...addProduct,
        price: Number(addProduct.price),
        stock: Number(addProduct.stock),
        images: addProduct.images
          ? addProduct.images.split(",").map((img) => img.trim()).filter(Boolean)
          : [],
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
        images: "",
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
      <Button className="mb-3" onClick={() => { setShowAdd(true); setError(""); setSuccess(""); }}>
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
            <th>Danh mục</th>
            <th>Ảnh</th>
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
              <td>{p.categories?.name || "Không rõ"}</td>
              <td>
                {Array.isArray(p.images) && p.images.length > 0 ? (
                  <div style={{ display: "flex", gap: 4 }}>
                    {p.images.map((img, idx) => (
                      <Image
                        key={idx}
                        src={img}
                        alt="Ảnh"
                        style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 4 }}
                        thumbnail
                      />
                    ))}
                  </div>
                ) : (
                  <span className="text-muted">Không có</span>
                )}
              </td>
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
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Giá</Form.Label>
              <Form.Control
                type="number"
                value={addProduct.price}
                onChange={e => setAddProduct({ ...addProduct, price: e.target.value })}
                min={0}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tồn kho</Form.Label>
              <Form.Control
                type="number"
                value={addProduct.stock}
                onChange={e => setAddProduct({ ...addProduct, stock: e.target.value })}
                min={0}
                required
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
                required
              >
                <option value="">Chọn danh mục</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Ảnh sản phẩm</Form.Label>
              <Form.Control
                type="file"
                multiple
                accept="image/*"
                onChange={e => setAddProduct({ ...addProduct, images: e.target.files })}
                required
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
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Giá</Form.Label>
                <Form.Control
                  type="number"
                  value={editProduct.price}
                  onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                  min={0}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Tồn kho</Form.Label>
                <Form.Control
                  type="number"
                  value={editProduct.stock}
                  onChange={(e) => setEditProduct({ ...editProduct, stock: e.target.value })}
                  min={0}
                  required
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
              <Form.Group className="mb-3">
                <Form.Label>Mô tả</Form.Label>
                <Form.Control
                  as="textarea"
                  value={editProduct.description}
                  onChange={e => setEditProduct({ ...editProduct, description: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Danh mục</Form.Label>
                <Form.Select
                  value={editProduct.categories}
                  onChange={e => setEditProduct({ ...editProduct, categories: e.target.value })}
                  required
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
                  value={editProduct.images || ""}
                  onChange={e => setEditProduct({ ...editProduct, images: e.target.value })}
                  placeholder="https://example.com/1.jpg, https://example.com/2.jpg"
                  required
                />
                <Form.Text className="text-muted">
                  Mỗi link phải là một URL hợp lệ (jpg, png, ...).
                </Form.Text>
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