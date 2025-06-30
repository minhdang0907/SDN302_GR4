const express = require("express");
const router = express.Router();
const cartController = require("../controller/cart.controller");

router.post("/add", cartController.addToCart);
router.get("/:user_id", cartController.getCart);
router.put("/update", cartController.updateCartItem);
router.delete("/remove", cartController.removeCartItem);
router.delete("/clear", cartController.clearCart);

module.exports = router;
