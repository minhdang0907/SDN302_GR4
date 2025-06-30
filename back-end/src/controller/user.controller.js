const bcrypt = require("bcrypt");
const User = require("../models/user");
const nodemailer = require("nodemailer");

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hàm gửi mail OTP
async function sendOTPEmail(to, otp) {
    // Cấu hình transporter với Gmail (hoặc SMTP khác)
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "nguyenlink3387@gmail.com", // Thay bằng email của bạn
            pass: "qrcc opli uumc cfrv" // Thay bằng mật khẩu ứng dụng hoặc mật khẩu email của bạn
        }
    });

    // Nội dung email
    let mailOptions = {
        from: '"Shop GR4" <yourgmail@gmail.com>',
        to,
        subject: "Mã OTP xác thực tài khoản",
        text: `Mã OTP của bạn là: ${otp}`
    };

    await transporter.sendMail(mailOptions);
}

exports.register = async (req, res) => {
    try {
        const { full_name, email, phone, password } = req.body;

        if (!password || password.length < 8) {
            return res.status(400).json({ error: "Mật khẩu phải có ít nhất 8 ký tự" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email đã tồn tại" });
        }

        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return res.status(400).json({ error: "Số điện thoại đã tồn tại" });
        }

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        const otp = generateOTP();
        const otp_expiry = new Date(Date.now() + 10 * 60 * 1000);


        // Lưu user với is_verified: false, otp, otp_expiry
        const user = new User({
            full_name,
            email,
            phone,
            password: hashedPassword,
            otp,
            otp_expiry,
            is_verified: false
        });
        await user.save();

        await sendOTPEmail(email, otp);

        res.status(200).json({
            message: "OTP đã được gửi qua email."
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

        res.json({ message: "Đăng ký thành công!" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.requestResetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "Không tìm thấy user" });

        const otp = generateOTP();
        const otp_expiry = new Date(Date.now() + 10 * 60 * 1000);
        user.otp = otp;
        user.otp_expiry = otp_expiry;
        await user.save();

        await sendOTPEmail(email, otp);

        res.json({ message: "OTP đặt lại mật khẩu đã được gửi qua email." });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp_input, new_password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: "Không tìm thấy user" });
        if (user.otp !== otp_input) return res.status(400).json({ error: "OTP không đúng" });
        if (user.otp_expiry < new Date()) return res.status(400).json({ error: "OTP đã hết hạn" });

        user.password = await bcrypt.hash(new_password, 10);
        user.otp = undefined;
        user.otp_expiry = undefined;
        await user.save();

        res.json({ message: "Đặt lại mật khẩu thành công!" });
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

        res.json({ message: "Đăng ký thành công!" });
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

// Thêm địa chỉ mới
exports.addAddress = async (req, res) => {
    try {
        const { userId, address, is_default } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

        if (is_default) {
            user.addresses.forEach(addr => addr.is_default = false);
        }
        user.addresses.push({ address, is_default: !!is_default });
        await user.save();
        res.json({ message: "Đã thêm địa chỉ", addresses: user.addresses });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// Lấy danh sách địa chỉ
exports.getAddresses = async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId).select("addresses");
        if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
        res.json(user.addresses);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};