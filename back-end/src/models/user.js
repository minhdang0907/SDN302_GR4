const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  full_name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  // Thêm các field cho OTP và xác thực
  otp: { 
    type: String 
  },
  otp_expiry: { 
    type: Date 
  },
  is_verified: { 
    type: Boolean, 
    default: false 
  },
  // Thêm addresses
  addresses: [
    {
      address: { 
        type: String, 
        required: true 
      },
      is_default: { 
        type: Boolean, 
        default: false 
      }
    }
  ]
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  }
});

module.exports = mongoose.model('User', userSchema);
