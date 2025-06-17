const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CartSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      product_id: { type: Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, required: true }
    }
  ],
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const Cart = mongoose.model("Cart", CartSchema);
module.exports = Cart;
