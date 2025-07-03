const Product = require("../models/product.js");

// [GET] /products - Lấy danh sách sản phẩm
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
    const newProduct = new Product(req.body);
    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// [PUT] /products/:id - Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
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

const handleAddProduct = async () => {
  try {
    await axios.post("http://localhost:9999/products", {
      ...addProduct,
      price: Number(addProduct.price),
      stock: Number(addProduct.stock),
      images: addProduct.images
        ? addProduct.images.split(",").map((img) => img.trim())
        : [],
    });
    setShowAdd(false);
    setSuccess("Đã thêm sản phẩm mới!");
    setAddProduct({
      name: "",
      price: "",
      stock: "",
      is_available: true,
      description: "",
      categories: "",
      images: "",
    });
    fetchProducts();
  } catch (err) {
    setError("Thêm sản phẩm thất bại");
  }
};


