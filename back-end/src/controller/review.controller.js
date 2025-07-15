const mongoose = require("mongoose");
const Review = require("../models/review.js");
const Order = require("../models/order.js");
const Product = require("../models/product.js");
require("../models/user");

// Lấy đánh giá theo product ID với thống kê
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

    // Get reviews with pagination
    const reviews = await Review.find(query)
      .populate("user_id", "name email")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Review.countDocuments(query);

    // Calculate statistics
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

// Lấy đánh giá của user
const getReviewsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const { page = 1, limit = 10 } = req.query;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID người dùng không hợp lệ." });
    }

    const skip = (page - 1) * limit;

    const reviews = await Review.find({ user_id: userId })
      .populate('product_id', 'name images price')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments({ user_id: userId });

    res.status(200).json({
      reviews,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error("Lỗi khi lấy đánh giá của user:", error);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// Kiểm tra user đã review sản phẩm chưa
const checkUserReview = async (req, res) => {
  try {
    const { userId, productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "ID không hợp lệ." });
    }

    const review = await Review.findOne({
      user_id: userId,
      product_id: productId
    });

    res.status(200).json({ hasReviewed: !!review });
  } catch (error) {
    console.error("Lỗi khi kiểm tra review:", error);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// Tạo đánh giá mới
const createReview = async (req, res) => {
  try {
    const { user_id, product_id, rating, comment } = req.body;

    // Validate input
    if (!user_id || !product_id || !rating || !comment) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc." });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Đánh giá phải từ 1 đến 5 sao." });
    }

    if (comment.trim().length < 10) {
      return res.status(400).json({ message: "Nhận xét phải có ít nhất 10 ký tự." });
    }

    // Kiểm tra xem user đã mua sản phẩm này chưa
    const order = await Order.findOne({
      user_id,
      "items.product_id": product_id,
      status: "delivered"
    });

    if (!order) {
      return res.status(400).json({ 
        message: "Bạn chỉ có thể đánh giá sản phẩm đã mua và đã được giao." 
      });
    }

    // Kiểm tra xem đã review chưa
    const existingReview = await Review.findOne({ user_id, product_id });
    if (existingReview) {
      return res.status(400).json({ message: "Bạn đã đánh giá sản phẩm này rồi." });
    }

    const review = new Review({
      user_id,
      product_id,
      rating: parseInt(rating),
      comment: comment.trim()
    });

    await review.save();
    
    const populatedReview = await Review.findById(review._id)
      .populate("user_id", "name email")
      .populate("product_id", "name");

    res.status(201).json({
      message: "Đánh giá thành công!",
      review: populatedReview
    });
  } catch (error) {
    console.error("Lỗi khi tạo đánh giá:", error);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// Cập nhật đánh giá
const updateReview = async (req, res) => {
  try {
    const reviewId = req.params.id;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: "ID đánh giá không hợp lệ." });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: "Đánh giá phải từ 1 đến 5 sao." });
    }

    if (comment && comment.trim().length < 10) {
      return res.status(400).json({ message: "Nhận xét phải có ít nhất 10 ký tự." });
    }

    const updateData = {};
    if (rating) updateData.rating = parseInt(rating);
    if (comment) updateData.comment = comment.trim();
    updateData.updated_at = new Date();

    const review = await Review.findByIdAndUpdate(
      reviewId,
      updateData,
      { new: true }
    ).populate("user_id", "name email")
     .populate("product_id", "name");

    if (!review) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá." });
    }

    res.status(200).json({
      message: "Cập nhật đánh giá thành công!",
      review
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật đánh giá:", error);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// Xóa đánh giá
const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ message: "ID đánh giá không hợp lệ." });
    }

    const review = await Review.findByIdAndDelete(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Không tìm thấy đánh giá." });
    }

    res.status(200).json({ message: "Xóa đánh giá thành công!" });
  } catch (error) {
    console.error("Lỗi khi xóa đánh giá:", error);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// Lấy tất cả đánh giá (admin)
const getAllReviews = async (req, res) => {
  try {
    const { page = 1, limit = 20, rating, sortBy = 'newest' } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
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
      .populate("user_id", "name email")
      .populate("product_id", "name images")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Review.countDocuments(query);

    
    res.status(200).json({
      reviews,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error("Lỗi khi lấy tất cả đánh giá:", error);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

// Helper function: Tính toán thống kê đánh giá
const calculateReviewStats = (reviews) => {
  if (!reviews || reviews.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }

  const totalReviews = reviews.length;
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / totalReviews;

  const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(review => {
    ratingDistribution[review.rating]++;
  });

  return {
    totalReviews,
    averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
    ratingDistribution
  };
};

// Lấy thống kê tổng quan đánh giá (dashboard)
const getReviewStatistics = async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments();
    const recentReviews = await Review.find()
      .sort({ created_at: -1 })
      .limit(5)
      .populate("user_id", "name")
      .populate("product_id", "name");

    // Thống kê theo rating
    const ratingStats = await Review.aggregate([
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: -1 }
      }
    ]);

    // Thống kê theo tháng (6 tháng gần nhất)
    const monthlyStats = await Review.aggregate([
      {
        $match: {
          created_at: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$created_at" },
            month: { $month: "$created_at" }
          },
          count: { $sum: 1 },
          averageRating: { $avg: "$rating" }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    // Top sản phẩm có nhiều đánh giá nhất
    const topReviewedProducts = await Review.aggregate([
      {
        $group: {
          _id: "$product_id",
          reviewCount: { $sum: 1 },
          averageRating: { $avg: "$rating" }
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $unwind: "$product"
      },
      {
        $sort: { reviewCount: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          productName: "$product.name",
          productImage: { $arrayElemAt: ["$product.images", 0] },
          reviewCount: 1,
          averageRating: { $round: ["$averageRating", 1] }
        }
      }
    ]);

    res.status(200).json({
      totalReviews,
      recentReviews,
      ratingStats,
      monthlyStats,
      topReviewedProducts
    });
  } catch (error) {
    console.error("Lỗi khi lấy thống kê đánh giá:", error);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

module.exports = { 
  getReviewByProductId,
  getReviewsByUserId,
  checkUserReview,
  createReview,
  updateReview,
  deleteReview,
  getAllReviews,
  getReviewStatistics
};
