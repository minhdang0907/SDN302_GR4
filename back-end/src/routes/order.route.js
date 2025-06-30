const express = require("express");
const router = express.Router();
const orderController = require("../controller/order.controller");

router.get("/", orderController.getAllOrder);
router.put("/:id/status", orderController.updateOrderStatus);
module.exports = router;
