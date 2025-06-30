
const mongoose = require("mongoose");
const Review = require("../models/review.js");
require("../models/user");
const getReviewByProductId = async (req, res) => {
  try {
    const productId = req.params.id;

    if (!productId || !mongoose.Types.ObjectId.isValid(productId.trim())) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ hoặc bị thiếu." });
    }

    const cleanProductId = productId.trim();

    const reviews = await Review.find({ product_id: cleanProductId })
      .populate("user_id",)
      .populate("user_id", "name email")
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

module.exports = { getReviewByProductId };
