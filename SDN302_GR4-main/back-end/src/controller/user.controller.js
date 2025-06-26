const User = require("../models/user");
const bcrypt = require("bcryptjs"); // Thêm dòng này

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