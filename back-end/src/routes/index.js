const express = require("express");
const router = express.Router();

const productRoutes = require("./product.route");
const categoryRoutes = require("./category.route");
const userRouter = require("./user.route");

const reviewRoutes = require("./review.route");
const orderRoutes = require("./order.route");
const cartRoutes = require("./cart.route");
const discountRoutes = require("./discount.route");
const paymentRoutes = require("./payment.route");


router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/users", userRouter);

router.use("/reviews", reviewRoutes);
router.use("/orders", orderRoutes);
router.use("/carts", cartRoutes);

router.use("/discounts", discountRoutes);

router.use("/payment", paymentRoutes);
module.exports = router;
module.exports = router;


