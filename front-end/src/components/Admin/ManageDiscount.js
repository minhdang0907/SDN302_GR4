import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Container } from "react-bootstrap";

const ManageDiscount = () => {
  const [discounts, setDiscounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);

  const fetchDiscounts = async () => {
    const res = await axios.get("http://localhost:9999/discounts");
    setDiscounts(res.data);
  };

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const handleSubmit = async () => {
    try {
      if (editId) {
        await axios.put(`http://localhost:9999/discounts/${editId}`, form);
      } else {
        await axios.post("http://localhost:9999/discounts", form);
      }
      setShowModal(false);
      fetchDiscounts();
    } catch (err) {
      alert("Lỗi: " + err.response?.data?.error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xoá?")) {
      await axios.delete(`http://localhost:9999/discounts/${id}`);
      fetchDiscounts();
    }
  };

  return (
    <Container className="py-4">
      <h3>Quản lý mã giảm giá</h3>
      <Button className="mb-3" onClick={() => { setForm({}); setEditId(null); setShowModal(true); }}>
        Thêm mã mới
      </Button>

      <Table bordered hover responsive>
        <thead className="table-light">
          <tr>
            <th>Mã</th>
            <th>Mô tả</th>
            <th>Phần trăm</th>
            <th>Hiệu lực</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {discounts.map((d) => (
            <tr key={d._id}>
              <td>{d.code}</td>
              <td>{d.description}</td>
              <td>{d.discount_percent}%</td>
              <td>{new Date(d.valid_from).toLocaleDateString()} - {new Date(d.valid_to).toLocaleDateString()}</td>
              <td>{d.is_active ? "Active" : "Unactive"}</td>
              <td>
                <Button size="sm" variant="warning" onClick={() => { setForm(d); setEditId(d._id); setShowModal(true); }}>Sửa</Button>{" "}
                <Button size="sm" variant="danger" onClick={() => handleDelete(d._id)}>Xoá</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editId ? "Chỉnh sửa" : "Thêm mới"} mã giảm giá</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Mã</Form.Label>
              <Form.Control value={form.code || ""} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Phần trăm giảm</Form.Label>
              <Form.Control type="number" value={form.discount_percent || ""} onChange={(e) => setForm({ ...form, discount_percent: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Từ ngày</Form.Label>
              <Form.Control type="date" value={form.valid_from?.substring(0,10) || ""} onChange={(e) => setForm({ ...form, valid_from: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Đến ngày</Form.Label>
              <Form.Control type="date" value={form.valid_to?.substring(0,10) || ""} onChange={(e) => setForm({ ...form, valid_to: e.target.value })} />
            </Form.Group>
            <Form.Check
              type="checkbox"
              label="Hoạt động"
              checked={form.is_active || false}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Huỷ</Button>
          <Button variant="primary" onClick={handleSubmit}>Lưu</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageDiscount;
