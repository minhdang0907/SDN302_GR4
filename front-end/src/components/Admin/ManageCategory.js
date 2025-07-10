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
    if (editId) {
      // Update category
      axios
        .put(`http://localhost:9999/categories/${editId}`, form)
        .then(() => {
          setCategories(
            categories.map((c) => (c._id === editId ? { ...c, ...form } : c))
          );
          toast.success("Cập nhật thành công");
          setShowModal(false);
        })
        .catch(() => {
          toast.error("Cập nhật thất bại");
        });
    } else {
      // Create new category
      axios
        .post("http://localhost:9999/categories", form)
        .then((res) => {
          setCategories([...categories, res.data]);
          toast.success("Thêm mới thành công");
          setShowModal(false);
        })
        .catch(() => {
          toast.error("Thêm mới thất bại");
        });
    }
  };

  const handleDelete = (cate) => {
    if (!window.confirm("Bạn có chắc chắn muốn xoá?")) return;

    axios
      .delete(
        cate.deleted
          ? `http://localhost:9999/categories/${cate._id}/restore`
          : `http://localhost:9999/categories/${cate._id}`
      )
      .then(() => {
        setCategories(
          categories.map((c) =>
            c._id === cate._id ? { ...c, deleted: !c.deleted } : c
          )
        );
        toast.success(cate.deleted ? "Khôi phục thành công" : "Xoá thành công");
      })
      .catch(() => {
        toast.error("Xoá thất bại");
      });
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
                {!c.deleted ? (
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(c)}
                  >
                    Xoá
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => handleDelete(c)}
                  >
                    Khôi phục
                  </Button>
                )}
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
