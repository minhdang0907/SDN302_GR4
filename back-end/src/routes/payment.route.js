
const express = require("express");
const router = express.Router();
const { createPayOSLink } = require("../controller/payment.controller");

router.post("/payos/create", createPayOSLink);
module.exports = router;
