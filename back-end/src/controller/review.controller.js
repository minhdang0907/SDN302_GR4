
const mongoose = require("mongoose");
const Review = require("../models/review.js");
require("../models/user");


// Hàm tính toán thống kê đánh giá
const calculateReviewStats = (reviews) => {
  const totalReviews = reviews.length;
  if (totalReviews === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let totalRating = 0;

  reviews.forEach(review => {
    ratingDistribution[review.rating]++;
    totalRating += review.rating;
  });

  return {
    averageRating: (totalRating / totalReviews).toFixed(1),
    totalReviews,
    ratingDistribution
  };
};

const getReviewByProductId = async (req, res) => {
  try {
    const productId = req.params.id;
    const { page = 1, limit = 10, rating, sortBy = 'newest' } = req.query;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId.trim())) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ hoặc bị thiếu." });
    }

    const cleanProductId = productId.trim();
    const skip = (page - 1) * limit;

    // Build query
    const query = { product_id: cleanProductId };
    if (rating) query.rating = parseInt(rating);

    // Build sort
    let sort = {};
    switch (sortBy) {
      case 'oldest': sort = { created_at: 1 }; break;
      case 'highest': sort = { rating: -1, created_at: -1 }; break;
      case 'lowest': sort = { rating: 1, created_at: -1 }; break;
      default: sort = { created_at: -1 };
    }

    const reviews = await Review.find(query)
      .populate("user_id", "full_name email")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);
    const allReviews = await Review.find({ product_id: cleanProductId });
    const stats = calculateReviewStats(allReviews);

    res.status(200).json({
      reviews,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
      stats
    });
  } catch (error) {
    console.error("Lỗi khi lấy đánh giá:", error);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// ✨ THÊM FUNCTION TẠO ĐÁNH GIÁ
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

// ✨ THÊM FUNCTION KIỂM TRA ĐÁNH GIÁ
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

module.exports = { 
  getReviewByProductId,
  createReview,
  checkUserReview
 };
