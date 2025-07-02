const express = require("express");
const router = express.Router();
const categoryController = require("../controller/category.controller");
const { verifyToken } = require("../middleware/auth.middleware");

// GET /categories
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.post("/", verifyToken, categoryController.createCategory);
router.delete("/:id", verifyToken, categoryController.deleteCategory);
router.patch("/:id/restore", verifyToken, categoryController.restoreCategory);

module.exports = router;
