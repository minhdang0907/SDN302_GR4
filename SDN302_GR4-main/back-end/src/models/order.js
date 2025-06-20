const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product_id: { type: Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }
  ],
  total_amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  shipping_address: { type: String, required: true },
  payment_method: { type: String, enum: ['COD', 'online'], required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;
