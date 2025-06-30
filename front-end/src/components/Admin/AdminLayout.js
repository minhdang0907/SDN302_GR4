import { Outlet } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";

const AdminLayout = () => {
  return (
    <div className="admin-container">
      <AdminNavbar />
      <Outlet />
    </div>
  );
};

export default AdminLayout;
