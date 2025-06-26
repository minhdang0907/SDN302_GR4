const express = require("express");
const router = express.Router();

const productRoutes = require("./product.route");
const categoryRoutes = require("./category.route");
const userRouter = require("./user.route");


router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/users", userRouter);


module.exports = router;