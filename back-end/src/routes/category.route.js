const express = require("express");
const router = express.Router();
const categoryController = require("../controller/category.controller");

// GET /categories
router.get("/", categoryController.getAllCategories);

module.exports = router;
