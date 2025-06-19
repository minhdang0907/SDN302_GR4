const express = require("express");
const router = express.Router();
const productController = require("../controller/product.controller");

// GET tất cả sản phẩm
router.get("/", productController.getAllProducts);

// GET sản phẩm theo ID
router.get("/:id", productController.getProductById);

// POST tạo mới sản phẩm
router.post("/", productController.createProduct);

// PUT cập nhật sản phẩm
router.put("/:id", productController.updateProduct);

// DELETE sản phẩm
router.delete("/:id", productController.deleteProduct);

module.exports = router;
