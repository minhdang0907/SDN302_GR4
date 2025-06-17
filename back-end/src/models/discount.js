const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DiscountSchema = new Schema({
  code: { type: String, required: true, unique: true },
  description: { type: String },
  discount_percent: { type: Number, required: true },
  valid_from: { type: Date, required: true },
  valid_to: { type: Date, required: true },
  is_active: { type: Boolean, default: true }
});

const Discount = mongoose.model("Discount", DiscountSchema);
module.exports = Discount;
