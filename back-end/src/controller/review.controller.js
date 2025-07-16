
const mongoose = require("mongoose");
const Review = require("../models/review.js");
require("../models/user");

// sửa đổi hàm getReviewByProductId để sử dụng hàm tính toán thống kê đánh giá
const getReviewByProductId = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId.trim())) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ hoặc bị thiếu." });
    }

    const cleanProductId = productId.trim();

    const reviews = await Review.find({ product_id: cleanProductId })
      .populate("user_id",)
      .sort({ created_at: -1 });

    if (!reviews.length) {
      return res.status(404).json({ message: "Không có đánh giá nào cho sản phẩm này." });
    }

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Lỗi khi lấy đánh giá:", error);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// THÊM FUNCTION TẠO ĐÁNH GIÁ
const createReview = async (req, res) => {
  try {
    const { user_id, product_id, rating, comment } = req.body;

    // Validate required fields
    if (!user_id || !product_id || !rating) {
      return res.status(400).json({
        message: "Thiếu thông tin bắt buộc: user_id, product_id, rating"
      });
    }

    // Kiểm tra đã đánh giá chưa
    const existingReview = await Review.findOne({
      user_id,
      product_id
    });

    if (existingReview) {
      return res.status(400).json({
        message: "Bạn đã đánh giá sản phẩm này rồi"
      });
    }

    // Tạo đánh giá mới
    const review = new Review({
      user_id,
      product_id,
      rating: parseInt(rating),
      comment: comment || ""
    });

    await review.save();
    await review.populate("user_id", "full_name");

    res.status(201).json({
      message: "Đánh giá thành công",
      review
    });

  } catch (error) {
    console.error("Lỗi khi tạo đánh giá:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// THÊM FUNCTION KIỂM TRA ĐÁNH GIÁ
const checkUserReview = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    const review = await Review.findOne({
      user_id: userId,
      product_id: productId
    });

    res.status(200).json({
      hasReviewed: !!review,
      review: review || null
    });
  } catch (error) {
    console.error("Lỗi khi kiểm tra đánh giá:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

const checkExistingReview = async (req, res) => {
  try {
    const { userId, productId, orderId } = req.params;
    
    const existingReview = await Review.findOne({
      user_id: userId,
      product_id: productId,
      order_id: orderId
    });
    
    res.status(200).json({
      hasReviewed: !!existingReview,
      review: existingReview
    });
    
  } catch (error) {
    console.error("Lỗi kiểm tra review:", error);
    res.status(500).json({ hasReviewed: false });
  }
};

module.exports = {
  getReviewByProductId,
  createReview,
  checkUserReview,
  checkExistingReview
};
