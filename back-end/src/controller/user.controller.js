const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "kkkuyygyguygytftyfytftfytdrtdtfygytxseedfyuhhytyyh";

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.register = async (req, res) => {
    try {
        const { full_name, email, phone, password } = req.body;

        // Kiểm tra mật khẩu
        if (!password || password.length < 8) {
            return res.status(400).json({ error: "Mật khẩu phải có ít nhất 8 ký tự" });
        }

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email đã tồn tại" });
        }

        // Kiểm tra số điện thoại đã tồn tại chưa
        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return res.status(400).json({ error: "Số điện thoại đã tồn tại" });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        const otp = generateOTP();
        const otp_expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

        const user = new User({ full_name, email, phone, password: hashedPassword, otp, otp_expiry });
        await user.save();

        res.status(201).json({
            message: "Đăng ký thành công! OTP đã được tạo.",
            otp // Trả OTP về response để bạn test dễ dàng
        });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ error: "Không tìm thấy user" });
        if (user.is_verified) return res.status(400).json({ error: "Tài khoản đã xác thực" });
        if (user.otp !== otp) return res.status(400).json({ error: "OTP không đúng" });
        if (user.otp_expiry < new Date()) return res.status(400).json({ error: "OTP đã hết hạn" });

        user.is_verified = true;
        user.otp = undefined;
        user.otp_expiry = undefined;
        await user.save();

        res.json({ message: "Xác thực thành công!" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};
// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    const isMatch = await bcrypt.compare(password, user.password);
if (!isMatch) return res.status(400).json({ message: "Mật khẩu không đúng" });

    //   return res.status(400).json({ message: "Email hoặc mật khẩu không đúng" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      SECRET_KEY,
      { expiresIn: "2h" }
    );

    res.cookie("token", token, { httpOnly: true, maxAge: 2 * 60 * 60 * 1000 });

    res.status(200).json({ message: "Đăng nhập thành công", token, user_id: user._id, role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Đăng xuất
exports.logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Đăng xuất thành công" });
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(404).json({ error: "Không tìm thấy user" });
        if (user.is_verified) return res.status(400).json({ error: "Tài khoản đã xác thực" });
        if (user.otp !== otp) return res.status(400).json({ error: "OTP không đúng" });
        if (user.otp_expiry < new Date()) return res.status(400).json({ error: "OTP đã hết hạn" });

        user.is_verified = true;
        user.otp = undefined;
        user.otp_expiry = undefined;
        await user.save();

        res.json({ message: "Xác thực thành công!" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password -otp -otp_expiry");

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    res.json(user);
  } catch (err) {
    console.error("Lỗi khi lấy thông tin người dùng:", err.message);
    res.status(500).json({ message: "Lỗi server" });
  }
};