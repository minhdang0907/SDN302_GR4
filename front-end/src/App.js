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
import Checkout from "./components/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutFail from "./pages/CheckoutFail";
import ManageProduct from "./components/Admin/ManageProduct"; // Import ManageProduct component
<<<<<<< HEAD
import ManageCategory from "./components/Admin/ManageCategory";
import ManageUser from "./components/Admin/ManageUser";
import ManageReview from "./components/Admin/ManageReview";
=======
import ManageUser from "./components/Admin/ManageUser"; // Thêm dòng này
>>>>>>> LinhBD
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
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/checkout/fail" element={<CheckoutFail />} />
          </Route>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/orders" element={<ManageOrder />} />
            <Route path="/admin/discounts" element={<ManageDiscount />} />
<<<<<<< HEAD
            <Route path="/admin/categories" element={<ManageCategory />} />
            <Route path="/admin/users" element={<ManageUser />} />
            <Route path="/admin/reviews" element={<ManageReview />} />
            <Route path="/admin/products" element={<ManageProduct />} />
=======
            <Route path="/admin/products" element={<ManageProduct />} />
            <Route path="/admin/users" element={<ManageUser />} /> {/* Thêm route quản lý user */}
>>>>>>> LinhBD
          </Route>
        </Routes>
        <ToastContainer />
      </>
    </BrowserRouter>
  );
}

export default App;
