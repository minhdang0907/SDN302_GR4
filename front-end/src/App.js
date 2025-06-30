import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProductList from "./components/ProductList";
import ProductDetail from "./components/ProductDetail";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import Admin from "./pages/Admin";
import UserLayout from "./components/UserLayout";
import AdminLayout from "./components/Admin/AdminLayout";
import ManageOrder from "./components/Admin/ManageOrder";
import ManageDiscount from "./components/Admin/ManageDiscount";
import Cart from "./components/Cart";
function App() {
  return (
    <BrowserRouter>
      <>
        <Routes>
          <Route element={<UserLayout />}>
            <Route path="/" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/cart" element={<Cart />} />
          </Route>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/orders" element={<ManageOrder />} />
            <Route path="/admin/discounts" element={<ManageDiscount />} />
          </Route>
        </Routes>
        <ToastContainer />
      </>
    </BrowserRouter>
  );
}

export default App;
