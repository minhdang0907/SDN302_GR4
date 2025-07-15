import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProductList from "./components/ProductList";
import ProductDetail from "./components/ProductDetail";
import Login from "./components/Login";
import Register from "./components/Register";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import ManageReview from './components/Admin/ManageReview';
import MyReviews from './components/MyReviews';
import UserLayout from "./components/UserLayout";
import AdminLayout from "./components/Admin/AdminLayout";
import ManageOrder from "./components/Admin/ManageOrder";
import ManageDiscount from "./components/Admin/ManageDiscount";
import ManageOrderHistory from "./components/Admin/ManageOrderHistory"; // Tên file đúng như trong hình
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import CheckoutSuccess from "./components/CheckoutSuccess";
import CheckoutFail from "./components/CheckoutFail";
import ManageProduct from "./components/Admin/ManageProduct";
import UserOrderHistory from "./components/UserOrderHistory"; // File này nằm trong components
import Admin from "./components/Admin/Admin"; // File này nằm trong components/Admin
function App() {
  return (
    <BrowserRouter>
      <>
        <Routes>
          <Route element={<UserLayout />}>
            <Route path="/" element={<ProductList />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/checkout/fail" element={<CheckoutFail />} />
            <Route path="/order-history" element={<UserOrderHistory />} />
            <Route path="/my-reviews" element={<MyReviews />} />
          </Route>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/orders" element={<ManageOrder />} />
            <Route path="/admin/order-history" element={<ManageOrderHistory />} />
            <Route path="/admin/discounts" element={<ManageDiscount />} />
            <Route path="/admin/products" element={<ManageProduct />} />
            <Route path="/manage-review/:productId" element={<ManageReview />} />
          </Route>
        </Routes>
        <ToastContainer />
      </>
    </BrowserRouter>
  );
}

export default App;
