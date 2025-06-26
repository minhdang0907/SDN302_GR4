import axios from "axios";
import { useState } from "react";
import { Image } from "react-bootstrap";
import { toast } from "react-toastify";
import validator from "validator";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    rePassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (hasEmptyField(formData)) {
      toast.error("Vui lòng điền đầy đủ tất cả các trường.");
      return;
    }
    if (formData.password !== formData.rePassword) {
      toast.error("Password với RePassword không trùng nhau!");
      return;
    }
    if (!validator.isEmail(formData.email)) {
      toast.error("Sai format email!!!");
      return;
    }
    if (!validator.isMobilePhone(formData.phone, "vi-VN")) {
      toast.error("Sai format số điện thoại!!!");
      return;
    }

    try {
      const res = await axios.post("http://localhost:9999/users/register", {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      console.log(res);

      toast.success(res.data.message);
    } catch (res) {
      if (res.status === 400) {
        toast.error(res.response.data.error);
        return;
      }
    }
  };

  // const isValidEmail = (email) => {
  //   const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //   return regex.test(email);
  // };

  // const isValidPhone = (phone) => {
  //   const regex = /^[0-9]{10}$/;
  //   return regex.test(phone);
  // };

  const hasEmptyField = (formData) => {
    return Object.values(formData).some((value) => value.trim() === "");
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
              width={500}
              height={500}
            />
          </div>
          <div className="col-md-7 col-lg-5 col-xl-5 offset-xl-1">
            <form onSubmit={handleSubmit}>
              <div className="form-outline mb-4">
                <input
                  type="text"
                  name="fullName"
                  className="form-control form-control-lg"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                />
                <label className="form-label">Full Name</label>
              </div>

              <div className="form-outline mb-4">
                <input
                  type="email"
                  name="email"
                  className="form-control form-control-lg"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                />
                <label className="form-label">Email address</label>
              </div>

              <div className="form-outline mb-4">
                <input
                  type="text"
                  name="phone"
                  className="form-control form-control-lg"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <label className="form-label">Phone</label>
              </div>

              <div className="form-outline mb-4">
                <input
                  type="password"
                  name="password"
                  className="form-control form-control-lg"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <label className="form-label">Password</label>
              </div>

              <div className="form-outline mb-4">
                <input
                  type="password"
                  name="rePassword"
                  className="form-control form-control-lg"
                  placeholder="RePassword"
                  value={formData.rePassword}
                  onChange={handleChange}
                />
                <label className="form-label">RePassword</label>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg btn-block"
              >
                Sign up
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

export default Register;
