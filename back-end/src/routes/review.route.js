
const express = require("express");
const router  = express.Router();
const reviewController = require("../controller/review.controller");
const { verifyToken } = require("../middleware/auth.middleware");

// Lấy đánh giá theo ID sản phẩm
router.get("/product/:id", reviewController.getReviewByProductId);

//Thêm route tạo đánh giá
router.post("/", verifyToken, reviewController.createReview);
//thêm route kiểm tra đánh giá của user
router.get("/check/:userId/:productId", reviewController.checkUserReview);
module.exports = router;
