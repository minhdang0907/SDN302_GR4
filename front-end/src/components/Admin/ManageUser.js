import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Modal, Form, Alert } from "react-bootstrap";

function ManageUser() {
  const [users, setUsers] = useState([]);
  const [editUser, setEditUser] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addUser, setAddUser] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",
    is_verified: false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Lấy danh sách user
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:9999/users"); // Cần có API trả về tất cả user
      setUsers(res.data);
    } catch (err) {
      setError("Không thể tải danh sách user");
    }
  };

  // Thêm user
  const handleAddUser = async () => {
    try {
      await axios.post("http://localhost:9999/users/register", addUser);
      setShowAdd(false);
      setSuccess("Đã thêm user mới! (Cần xác thực OTP qua email)");
      setAddUser({
        full_name: "",
        email: "",
        phone: "",
        password: "",
        role: "customer",
        is_verified: false,
      });
      fetchUsers();
    } catch (err) {
      setError("Thêm user thất bại");
    }
  };

  // Xóa user
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa user này?")) return;
    try {
      await axios.delete(`http://localhost:9999/users/${id}`);
      setSuccess("Đã xóa user!");
      fetchUsers();
    } catch (err) {
      setError("Xóa thất bại");
    }
  };

  // Sửa user
  const handleEdit = (user) => {
    setEditUser({ ...user });
    setShowEdit(true);
    setError("");
    setSuccess("");
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`http://localhost:9999/users/${editUser._id}`, editUser);
      setShowEdit(false);
      setSuccess("Đã cập nhật user!");
      fetchUsers();
    } catch (err) {
      setError("Cập nhật thất bại");
    }
  };

  return (
    <div className="container mt-4">
      <h3>Quản lý người dùng</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Button className="mb-3" onClick={() => setShowAdd(true)}>
        Thêm user
      </Button>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Họ tên</th>
            <th>Email</th>
            <th>SĐT</th>
            <th>Role</th>
            <th>Xác thực</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.full_name}</td>
              <td>{u.email}</td>
              <td>{u.phone}</td>
              <td>{u.role}</td>
              <td>{u.is_verified ? "✔️" : "❌"}</td>
              <td>
                <Button variant="warning" size="sm" onClick={() => handleEdit(u)}>
                  Sửa
                </Button>{" "}
                <Button variant="danger" size="sm" onClick={() => handleDelete(u._id)}>
                  Xóa
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal thêm user */}
      <Modal show={showAdd} onHide={() => setShowAdd(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Thêm user mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Họ tên</Form.Label>
              <Form.Control
                type="text"
                value={addUser.full_name}
                onChange={e => setAddUser({ ...addUser, full_name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={addUser.email}
                onChange={e => setAddUser({ ...addUser, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>SĐT</Form.Label>
              <Form.Control
                type="text"
                value={addUser.phone}
                onChange={e => setAddUser({ ...addUser, phone: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                value={addUser.password}
                onChange={e => setAddUser({ ...addUser, password: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Role</Form.Label>
              <Form.Select
                value={addUser.role}
                onChange={e => setAddUser({ ...addUser, role: e.target.value })}
              >
                <option value="customer">Khách hàng</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAdd(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleAddUser}>
            Thêm
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal sửa user */}
      <Modal show={showEdit} onHide={() => setShowEdit(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Sửa user</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editUser && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Họ tên</Form.Label>
                <Form.Control
                  type="text"
                  value={editUser.full_name}
                  onChange={e => setEditUser({ ...editUser, full_name: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>SĐT</Form.Label>
                <Form.Control
                  type="text"
                  value={editUser.phone}
                  onChange={e => setEditUser({ ...editUser, phone: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Role</Form.Label>
                <Form.Select
                  value={editUser.role}
                  onChange={e => setEditUser({ ...editUser, role: e.target.value })}
                >
                  <option value="customer">Khách hàng</option>
                  <option value="admin">Admin</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Xác thực</Form.Label>
                <Form.Check
                  type="checkbox"
                  label="Đã xác thực"
                  checked={editUser.is_verified}
                  onChange={e => setEditUser({ ...editUser, is_verified: e.target.checked })}
                />
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

export default ManageUser;