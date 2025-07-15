const express = require("express");
const router = express.Router();
const reviewController = require("../controller/review.controller");

router.get("/product/:id", reviewController.getReviewByProductId);
router.post("/", reviewController.createReview);

module.exports = router;
