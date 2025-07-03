import React, { useEffect, useState } from "react";
import axios from "../../utils/axios.customize";
import { Button, Container, Form, Modal, Table } from "react-bootstrap";
import { toast } from "react-toastify";

function ManageCategory() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      const res = await axios.get("http://localhost:9999/categories");
      setCategories(res);
    };
    fetchData();
  }, []);

  const handleSubmit = () => {
    toast.success("hẹ hẹ hẹ");
  };

  const handleDelete = () => {
    toast.error("hẹ hẹ hẹ");
  };

  return (
    <Container className="py-4">
      <h3>Quản lý Category</h3>
      <Button
        className="mb-3"
        onClick={() => {
          setForm({});
          setEditId(null);
          setShowModal(true);
        }}
      >
        Thêm mã mới
      </Button>

      <Table bordered hover responsive>
        <thead className="table-light">
          <tr>
            <th>Tên</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {categories?.map((c) => (
            <tr key={c._id}>
              <td>{c.name}</td>
              <td style={{ color: c.deleted ? "red" : "green" }}>
                {!c.deleted ? "Active" : "Inactive"}
              </td>

              <td>
                <Button
                  size="sm"
                  variant="warning"
                  onClick={() => {
                    setForm(c);
                    setEditId(c._id);
                    setShowModal(true);
                  }}
                >
                  Sửa
                </Button>{" "}
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(c._id)}
                >
                  Xoá
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editId ? "Chỉnh sửa" : "Thêm mới"} Category
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Tên</Form.Label>
              <Form.Control
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Huỷ
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Lưu
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ManageCategory;
