const express = require("express");
const router = express.Router();
const discountController = require("../controller/discount.controller");

router.post("/apply", discountController.applyDiscount);

module.exports = router;
