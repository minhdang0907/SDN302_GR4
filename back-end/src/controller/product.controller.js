const Product = require("../models/product.js");

// [GET] /products - Lấy danh    sản phẩm
exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;

    let filter = {};

    if (category) {
      filter.categories = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("categories")
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      products,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// [GET] /products/:id - Lấy chi tiết sản phẩm
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("categories");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// [POST] /products - Tạo sản phẩm mới
exports.createProduct = async (req, res) => {
  try {
    const imageUrls = req.files ? req.files.map(f => f.path) : [];
    const newProduct = new Product({
      ...req.body,
      images: imageUrls,
    });
    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// [PUT] /products/:id - Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    let updateData = { ...req.body };
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(f => f.path);
    }
    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// [DELETE] /products/:id - Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

