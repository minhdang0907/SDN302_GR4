// src/App.js
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

// Context
import { AuthProvider } from './context/AuthContext';

// Layouts và Protected Route
import UserLayout from "./components/UserLayout";
import AdminLayout from "./components/Admin/AdminLayout";
import ProtectedRoute from "./utils/ProtectedRoute"; 

// Pages & Components
import EditProfilePage from './components/EditProfilePage';
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
      <AuthProvider> {/* AuthProvider bao bọc toàn bộ ứng dụng để cung cấp ngữ cảnh xác thực */}
        <Routes>
          {/* === LUỒNG PUBLIC (Công khai - Không yêu cầu vai trò cụ thể, hiển thị UserLayout) === */}
          {/* Các trang này có thể truy cập bởi bất kỳ ai (khách, khách hàng, admin) */}
          <Route element={<UserLayout />}>
            {/* Trang chi tiết sản phẩm, thanh toán thành công/thất bại */}
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/checkout/fail" element={<CheckoutFail />} />
          </Route>

          {/* === LUỒNG AUTHENTICATION (Chỉ khi chưa đăng nhập) === */}
          {/* Các trang này chỉ có thể truy cập khi người dùng CHƯA đăng nhập. */}
          <Route
            element={
              <ProtectedRoute requireLoggedOut={true}>
                <UserLayout /> {/* Vẫn hiển thị UserLayout cho các trang này */}
              </ProtectedRoute>
            }
          >
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* === LUỒNG CUSTOMER (Dành riêng cho khách hàng - Bao gồm trang chủ và chỉnh sửa hồ sơ) === */}
          {/* Các trang này yêu cầu người dùng phải có vai trò 'customer' để truy cập. */}
          {/* UserLayout được đặt bên trong ProtectedRoute để đảm bảo rằng */}
          {/* Header của UserLayout không hiển thị cho vai trò admin khi họ cố gắng truy cập các trang này. */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <UserLayout /> {/* UserLayout chỉ được render nếu người dùng là 'customer' */}
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<ProductList />} /> {/* Trang chủ (ProductList) giờ đây chỉ dành cho 'customer' */}
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfilePage />} /> {/* Đã di chuyển vào đây */}
            <Route path="/checkout" element={<Checkout />} />
          </Route>

          {/* === LUỒNG ADMIN (Dành riêng cho quản trị viên) === */}
          {/* Toàn bộ layout và các trang quản trị được bọc bởi ProtectedRoute */}
          {/* để đảm bảo chỉ người dùng có vai trò 'admin' mới có thể truy cập. */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout /> {/* AdminLayout chỉ được render nếu người dùng là 'admin' */}
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
        <ToastContainer /> {/* Component để hiển thị thông báo toast */}
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
