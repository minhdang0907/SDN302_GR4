const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  otp: { type: String }, // Thêm trường OTP
  otp_expiry: { type: Date }, // Thời gian hết hạn OTP
  is_verified: { type: Boolean, default: false } // Đã xác thực chưa
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
