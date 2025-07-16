
const express = require("express");
const router  = express.Router();
const reviewController = require("../controller/review.controller");
const { verifyToken } = require("../middleware/auth.middleware");

// Lấy đánh giá theo ID sản phẩm
router.get("/product/:id", reviewController.getReviewByProductId);
//Thêm route tạo đánh giá
router.post("/", reviewController.createReview);
//thêm route kiểm tra đánh giá của user
router.get("/check/:userId/:productId", reviewController.checkUserReview);
// Kiểm tra review đã tồn tại
router.get("/check/:userId/:productId/:orderId", reviewController.checkExistingReview);
module.exports = router;
