const express = require("express");
const router = express.Router();
const categoryController = require("../controller/category.controller");

// GET /categories
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);
router.post("/", categoryController.createCategory);
router.delete("/:id", categoryController.deleteCategory);
router.patch("/:id/restore", categoryController.restoreCategory);

module.exports = router;
