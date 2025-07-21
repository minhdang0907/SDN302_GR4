const mongoose = require("mongoose");
const mongooseDelete = require('mongoose-delete');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  otp: { type: String },
  otp_expiry: { type: Date },
  is_verified: { type: Boolean, default: false },
  addresses: [
    {
      address: { type: String, required: true },
      is_default: { type: Boolean, default: false }
    }
  ]
});

UserSchema.plugin(mongooseDelete, { overrideMethods: 'all', deletedAt: true, deleted: true });

const User = mongoose.model("User", UserSchema);
module.exports = User;
