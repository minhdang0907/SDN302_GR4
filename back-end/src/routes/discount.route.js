const express = require("express");
const router = express.Router();
const discountController = require("../controller/discount.controller");

router.post("/apply", discountController.applyDiscount);
router.get("/", discountController.getAllDiscounts);
router.post("/", discountController.createDiscount);
router.put("/:id", discountController.updateDiscount);
router.delete("/:id", discountController.deleteDiscount);
module.exports = router;
