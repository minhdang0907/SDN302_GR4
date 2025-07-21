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
    const imageUrls = req.files ? req.files.map(f => f.path) : []; // Lấy đường dẫn ảnh từ req.files
    const newProduct = new Product({
      ...req.body,
      images: imageUrls, // Lưu danh sách ảnh vào mảng images
    });
    const saved = await newProduct.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error in createProduct:", err.message); // Debug thêm
    res.status(400).json({ message: err.message });
  }
};

// [PUT] /products/:id - Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    let updateData = { ...req.body };

    // Sửa: Merge existing_images và images (new)
    let existingImages = req.body.existing_images ? (Array.isArray(req.body.existing_images) ? req.body.existing_images : [req.body.existing_images]) : [];
    existingImages = existingImages.filter(img => img !== ""); // Lọc empty nếu không có cũ
    const newImages = req.files ? req.files.map(f => f.path) : [];
    updateData.images = [...existingImages, ...newImages]; // Kết hợp cũ và mới

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(updated);
  } catch (err) {
    console.error("Detailed error in updateProduct:", err.message, err.stack); // Debug chi tiết để xem lỗi 500
    res.status(400).json({ message: err.message });
  }
};

// [DELETE] /products/:id - Xóa mềm sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.deleteById(req.params.id); // Sửa từ Product.delete thành Product.deleteById
    if (!deleted) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// [PATCH] /products/:id/restore - Khôi phục sản phẩm
exports.restoreProduct = async (req, res) => {
  try {
    const restored = await Product.restore({ _id: req.params.id }); // Đảm bảo đúng cú pháp
    if (!restored) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product restored successfully" });
  } catch (err) {
    console.error("Error restoring product:", err.message); // Debug log
    res.status(500).json({ message: err.message });
  }
};

// [PATCH] /products/:id/remove-image - Xóa ảnh riêng (thêm mới để hỗ trợ xóa)
exports.removeImage = async (req, res) => {
  try {
    const { imageUrl } = req.body; // Nhận URL ảnh cần xóa từ body
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    product.images = product.images.filter(img => img !== imageUrl);
    await product.save();
    // Optional: Xóa file vật lý nếu cần, ví dụ fs.unlink(imageUrl.replace('uploads/', 'public/uploads/'));

    res.status(200).json({ message: "Image removed successfully", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};