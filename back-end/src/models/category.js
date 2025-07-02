const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

CategorySchema.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: "all",
});

const Category = mongoose.model("Category", CategorySchema);
module.exports = Category;
