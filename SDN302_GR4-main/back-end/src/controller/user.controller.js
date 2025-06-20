const User = require("../models/User");
const jwt = require("jsonwebtoken");

const SECRET_KEY = "kkk"; // Có thể đưa vào .env nếu cần

// Đăng ký (không mã hóa)
exports.register = async (req, res) => {
  try {
    const { full_name, email, phone, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const newUser = new User({
      full_name,
      email,
      phone,
      password, // không mã hóa
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role },
      SECRET_KEY,
      { expiresIn: "2h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 2 * 60 * 60 * 1000,
    });

    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
// Đăng xuất (xóa cookie token)
exports.logout = (req, res) => {
  res.clearCookie("token"); // Xóa cookie tên 'token'
  res.status(200).json({ message: "Đăng xuất thành công" });
};
// Đăng nhập (và trả về token dưới message)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Email không đúng" });

    if (password !== user.password)
      return res.status(400).json({ message: "Mật khẩu không đúng" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      SECRET_KEY,
      { expiresIn: "2h" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 2 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Đăng nhập thành công",
      token: token, // ✅ hiện token dưới message
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
