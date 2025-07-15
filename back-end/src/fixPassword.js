const bcrypt = require('bcrypt');
const User = require('./models/user'); // Đường dẫn đến model User
const mongoose = require('mongoose');

async function fixUserPassword() {
  try {
    // Kết nối database (thay đổi connection string của bạn)
    await mongoose.connect('mongodb://127.0.0.1:27017/ProjectGr4');
    
    // Lấy user cần fix (thay email thực tế của bạn)
    const email = 'tranvanb@example.com'; 
    const plainPassword = '123456'; // Mật khẩu gốc bạn muốn đặt
    
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Không tìm thấy user với email:', email);
      return;
    }
    
    console.log('User hiện tại:', {
      email: user.email,
      currentPassword: user.password,
      passwordLength: user.password?.length
    });
    
    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    console.log('Mật khẩu mới được hash:', hashedPassword);
    
    // Cập nhật mật khẩu
    user.password = hashedPassword;
    user.is_verified = true; // Đảm bảo tài khoản đã verified
    await user.save();
    
    console.log('✅ Đã cập nhật mật khẩu thành công!');
    console.log('Email:', email);
    console.log('Password:', plainPassword);
    
    // Test ngay lập tức
    const testMatch = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('✅ Test so sánh mật khẩu:', testMatch);
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    mongoose.disconnect();
  }
}

fixUserPassword();
