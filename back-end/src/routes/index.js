const express = require("express");
const router = express.Router();

const productRoutes  = require("./product.route");
const categoryRoutes = require("./category.route");


router.use("/products",  productRoutes);
router.use("/categories", categoryRoutes);


module.exports = router;