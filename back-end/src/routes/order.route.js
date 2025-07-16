const express = require("express");
const router = express.Router();
const orderController = require("../controller/order.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const checkRole = require("../middleware/role.middleware");

router.get("/", verifyToken, checkRole(["admin"]), orderController.getAllOrder);
router.put("/:id/status", verifyToken, checkRole(["admin"]), orderController.updateOrderStatus);
router.post("/", verifyToken, orderController.createOrder);
router.get("/user/:user_id", orderController.getOrdersByUserId);

module.exports = router;
