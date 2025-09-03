const express = require("express");
const router = express.Router();
const productController = require("../controller/product.controller");
const { upload } = require('../utils/cloudinary');

// GET tất cả sản phẩm
router.get("/", productController.getAllProducts);

// GET sản phẩm theo ID
router.get("/:id", productController.getProductById);

// POST tạo mới sản phẩm (upload nhiều ảnh)
router.post("/", upload.array("images", 5), productController.createProduct);

// PUT cập nhật sản phẩm
router.put("/:id", upload.array("images", 5), productController.updateProduct);

// DELETE sản phẩm
router.delete("/:id", productController.deleteProduct); // Xóa mềm
router.patch("/:id/restore", productController.restoreProduct); // Khôi phục

module.exports = router;
