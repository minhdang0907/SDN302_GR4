require("dotenv").config();
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY || "your_default_secret";
const bcrypt = require("bcrypt");
const User = require("../models/user");
const nodemailer = require("nodemailer");

function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hàm gửi mail OTP
async function sendOTPEmail(to, otp) {
    let transporter = nodemailer.createTransporter({
        service: "gmail",
        auth: {
            user: "nguyenlink3387@gmail.com",
            pass: "qrcc opli uumc cfrv"
        }
    });

    let mailOptions = {
        from: '"Shop GR4" <yourgmail@gmail.com>',
        to,
        subject: "Mã OTP xác thực tài khoản",
        text: `Mã OTP của bạn là: ${otp}`
    };

    await transporter.sendMail(mailOptions);
}

const userController = {
  // GET /api/users - Lấy tất cả users
  getAllUsers: async (req, res) => {
    try {
      const users = await User.find().select('-password -otp -otp_expiry');
      res.status(200).json({
        success: true,
        data: users,
        message: 'Lấy danh sách user thành công'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  },

  // GET /api/users/:id - Lấy user theo ID
  getUserById: async (req, res) => {
    try {
      const user = await User.findById(req.params.id).select('-password -otp -otp_expiry');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy user'
        });
      }
      res.status(200).json({
        success: true,
        data: user,
        message: 'Lấy thông tin user thành công'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  },

  // POST /api/users - Tạo user mới (admin tạo user)
  createUser: async (req, res) => {
    try {
      const { full_name, email, phone, password, role } = req.body;
      
      // Kiểm tra email đã tồn tại
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email đã được sử dụng'
        });
      }

      // Mã hóa mật khẩu
      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User({
        full_name,
        email,
        phone,
        password: hashedPassword,
        role: role || 'customer',
        is_verified: true // Admin tạo thì tự động verified
      });

      const savedUser = await newUser.save();
      
      // Loại bỏ password khỏi response
      const userResponse = savedUser.toObject();
      delete userResponse.password;

      res.status(201).json({
        success: true,
        data: userResponse,
        message: 'Tạo user thành công'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  },

  // PUT /api/users/:id - Cập nhật user
  updateUser: async (req, res) => {
    try {
      const { full_name, email, phone, role } = req.body;
      
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { full_name, email, phone, role },
        { new: true, runValidators: true }
      ).select('-password -otp -otp_expiry');

      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy user'
        });
      }

      res.status(200).json({
        success: true,
        data: updatedUser,
        message: 'Cập nhật user thành công'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  },

  // DELETE /api/users/:id - Xóa user
  deleteUser: async (req, res) => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.id);
      
      if (!deletedUser) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy user'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Xóa user thành công'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  },

  // GET /api/users/role/:role - Lấy users theo role
  getUsersByRole: async (req, res) => {
    try {
      const { role } = req.params;
      const users = await User.find({ role }).select('-password -otp -otp_expiry');
      
      res.status(200).json({
        success: true,
        data: users,
        message: `Lấy danh sách ${role} thành công`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: error.message
      });
    }
  },

  // === CÁC FUNCTION AUTH ===
  
  // Đăng ký
  register: async (req, res) => {
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
  },

  // Xác thực OTP
  verifyOTP: async (req, res) => {
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
  },

  // Yêu cầu reset password
  requestResetPassword: async (req, res) => {
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
  },

  // Reset password
  resetPassword: async (req, res) => {
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
  },

  // Đăng nhập
  login: async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('=== LOGIN DEBUG ===');
    console.log('Email nhận được:', email);
    console.log('Password nhận được:', password);
    console.log('Password type:', typeof password);
    console.log('Password length:', password?.length);

    // Tìm user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('❌ Không tìm thấy user với email:', email);
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    console.log('✅ Tìm thấy user:', {
      email: user.email,
      hasPassword: !!user.password,
      passwordLength: user.password?.length,
      isVerified: user.is_verified
    });

    // Kiểm tra mật khẩu có tồn tại không
    if (!user.password) {
      console.log('❌ User không có mật khẩu trong DB');
      return res.status(400).json({ message: "Lỗi dữ liệu tài khoản" });
    }

    // So sánh mật khẩu
    console.log('Đang so sánh mật khẩu...');
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Kết quả so sánh:', isMatch);
    
    if (!isMatch) {
      console.log('❌ Mật khẩu không khớp');
      // Thử hash password input để so sánh (trường hợp password chưa được hash)
      const directMatch = (password === user.password);
      console.log('So sánh trực tiếp:', directMatch);
      
      return res.status(400).json({ message: "Mật khẩu không đúng" });
    }

    console.log('✅ Mật khẩu đúng!');

    // Tạo token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      SECRET_KEY,
      { expiresIn: "2h" }
    );

    res.cookie("token", token, { httpOnly: true, maxAge: 2 * 60 * 60 * 1000 });

    console.log('✅ Đăng nhập thành công cho user:', user.email);

    res.status(200).json({ 
      message: "Đăng nhập thành công", 
      token, 
      user_id: user._id, 
      role: user.role 
    });
  } catch (err) {
    console.error('❌ Lỗi đăng nhập:', err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
},
// API debug - chỉ dùng khi develop, xóa khi deploy
debugUser: async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      role: user.role,
      is_verified: user.is_verified,
      hasPassword: !!user.password,
      passwordLength: user.password?.length,
      passwordStartsWith: user.password?.substring(0, 10) + '...'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
},


  // Đăng xuất
  logout: (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Đăng xuất thành công" });
  },

  // Thêm địa chỉ mới
  addAddress: async (req, res) => {
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
  },

  // Lấy danh sách địa chỉ
  getAddresses: async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await User.findById(userId).select("addresses");
      if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
      res.json(user.addresses);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};

module.exports = userController;
