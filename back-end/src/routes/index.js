const express = require("express");
const router = express.Router();

const productRoutes = require("./product.route");
const categoryRoutes = require("./category.route");

const reviewRoutes = require("./review.route");
const orderRoutes = require("./order.route");

router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);

router.use("/reviews", reviewRoutes);
router.use("/orders", orderRoutes);

module.exports = router;