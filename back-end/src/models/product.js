const mongoose = require("mongoose");
const Schema = mongoose.Schema;
require("./category.js");
const mongooseDelete = require('mongoose-delete');
const ProductSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  categories: { type: Schema.Types.ObjectId, ref: "Category" },
  images: [String],
  stock: { type: Number, required: true, default: 0 },
  is_available: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

ProductSchema.plugin(mongooseDelete, { overrideMethods: 'all', deletedAt: true, deleted: true });

const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;
