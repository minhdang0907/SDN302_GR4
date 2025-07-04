import React, { useState } from "react";
import "../assets/login.css"; // Đảm bảo bạn có file CSS này hoặc xóa dòng này
import { Image } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import validator from "validator";
// component Login không cần useNavigate nữa vì ta dùng window.location.href
// import { useNavigate } from "react-router-dom";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    // const navigate = useNavigate();

    const handleSubmit = async () => {
        if (!validator.isEmail(email)) {
            toast.error("Sai format email!!!");
            return;
        }

        try {
            const res = await axios.post(
                "http://localhost:9999/api/users/login",
                { email, password },
                { withCredentials: true }
            );

            toast.success(res.data.message);

            // ✅ LƯU THÔNG TIN VÀO LOCAL STORAGE
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify({
                fullName: res.data.full_name,
                userId: res.data.user_id,
                role: res.data.role
            }));

            // Tải lại trang để Header cập nhật trạng thái đăng nhập
            window.location.href = "/";

        } catch (err) {
            if (err.response && err.response.data) {
                toast.error(err.response.data.message || "Lỗi đăng nhập");
            } else {
                toast.error("Lỗi kết nối đến server");
            }
        }
    };

    return (
        <section className="vh-100">
            <div className="container py-5 h-100">
                <div className="row d-flex align-items-center justify-content-center h-100">
                    <div className="col-md-8 col-lg-7 col-xl-6">
                        <Image
                            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg"
                            className="img-fluid"
                            alt="Phone image"
                        />
                    </div>
                    <div className="col-md-7 col-lg-5 col-xl-5 offset-xl-1">
                        <form>
                            <div className="form-outline mb-4">
                                <input
                                    type="email"
                                    value={email}
                                    className="form-control form-control-lg"
                                    placeholder="Email"
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <label className="form-label">Email address</label>
                            </div>

                            <div className="form-outline mb-4">
                                <input
                                    type="password"
                                    value={password}
                                    className="form-control form-control-lg"
                                    placeholder="Password"
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <label className="form-label">Password</label>
                            </div>

                            <div className="d-flex justify-content-around align-items-center mb-4">
                                <div className="form-check">
                                    <input className="form-check-input" type="checkbox" defaultChecked />
                                    <label className="form-check-label"> Remember me </label>
                                </div>
                                <a href="/forgot-password">Forgot password?</a>
                            </div>

                            <button
                                type="button"
                                className="btn btn-primary btn-lg btn-block"
                                onClick={handleSubmit}
                            >
                                Sign in
                            </button>

                            <div className="divider d-flex align-items-center my-4">
                                <p className="text-center fw-bold mx-3 mb-0 text-muted">OR</p>
                            </div>

                            <a
                                className="btn btn-primary btn-lg btn-block"
                                style={{ backgroundColor: "#3b5998", margin: 5 }}
                                href="#!"
                                role="button"
                            >
                                <i className="fab fa-facebook-f me-2"></i>Continue with Facebook
                            </a>
                            <a
                                className="btn btn-primary btn-lg btn-block"
                                style={{ backgroundColor: "#55acee", margin: 5 }}
                                href="#!"
                                role="button"
                            >
                                <i className="fab fa-twitter me-2"></i>Continue with Twitter
                            </a>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Login;