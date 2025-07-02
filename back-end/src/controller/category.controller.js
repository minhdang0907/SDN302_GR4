const Category = require("../models/category.js");
const Product = require("../models/product.js");

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json({ message: "Category found", data: category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    const category = await newCategory.save();
    res.status(201).json({
      message: "Create category successfully!",
      data: category,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const products = await Product.findOne({ categories: req.params.id });
    if (!products) {
      const deleted = await Category.deleteOne({ _id: req.params.id });
      if (!deleted)
        return res.status(404).json({ message: "Category not found" });
      return res.status(200).json({ message: "Deleted successfully" });
    }

    const deleted = await Category.deleteById(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.restoreCategory = async (req, res) => {
  try {
    const deleted = await Category.restore({ _id: req.params.id });
    if (!deleted)
      return res.status(404).json({ message: "Category not found" });
    res.status(200).json({ message: "Restored successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
