const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("./category.js");
const ProductSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  categories: { type: Schema.Types.ObjectId, ref: "Category" },
  images: [String],
  stock: { type: Number, default: 0 },
  is_available: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
