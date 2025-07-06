// src/App.js
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

// Context
import { AuthProvider } from './context/AuthContext';

// Layouts and Protected Route
import UserLayout from "./components/UserLayout";
import AdminLayout from "./components/Admin/AdminLayout";
import ProtectedRoute from "./utils/ProtectedRoute"; // ✨ IMPORT "NGƯỜI GÁC CỔNG"

// Pages & Components
import ProductList from "./components/ProductList";
import ProductDetail from "./components/ProductDetail";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Admin from "./pages/Admin";
import ManageOrder from "./components/Admin/ManageOrder";
import ManageDiscount from "./components/Admin/ManageDiscount";
import ManageProduct from "./components/Admin/ManageProduct";
import ManageCategory from "./components/Admin/ManageCategory";
import ManageUser from "./components/Admin/ManageUser";
import ManageReview from "./components/Admin/ManageReview";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutFail from "./pages/CheckoutFail";
import Profile from './components/Profile';
function App() {
  return (
    <BrowserRouter>
      <AuthProvider> {/* AuthProvider bao bọc tất cả */}
        <Routes>
          {/* === LUỒNG PUBLIC & CUSTOMER === */}
          <Route element={<UserLayout />}>
            {/* Các trang công khai, ai cũng xem được */}
            <Route path="/" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            {/* Các trang cần đăng nhập với vai trò 'customer' */}
            <Route
              path="/cart"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Cart />
                </ProtectedRoute>
              }

            />
            <Route 
             path="/profile"
              element={
                <ProtectedRoute allowedRoles={['customer', 'admin']}>
                  <Profile />
                  </ProtectedRoute>
              }
              />
            <Route
              path="/checkout"
              element={
                <ProtectedRoute allowedRoles={['customer']}>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/checkout/fail" element={<CheckoutFail />} />
          </Route>

          {/* === LUỒNG ADMIN === */}
          <Route
            element={
              // ✨ Bọc toàn bộ layout admin bằng ProtectedRoute
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/orders" element={<ManageOrder />} />
            <Route path="/admin/discounts" element={<ManageDiscount />} />
            <Route path="/admin/categories" element={<ManageCategory />} />
            <Route path="/admin/users" element={<ManageUser />} />
            <Route path="/admin/reviews" element={<ManageReview />} />
            <Route path="/admin/products" element={<ManageProduct />} />
          </Route>
        </Routes>
        <ToastContainer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;