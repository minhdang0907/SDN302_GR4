const Discount = require("../models/discount");

exports.applyDiscount = async (req, res) => {
  try {
    const { code } = req.body;

    const discount = await Discount.findOne({ code, is_active: true });

    if (!discount) {
      return res.status(404).json({ message: "Mã giảm giá không tồn tại hoặc không hoạt động." });
    }

    const now = new Date();
    if (now < discount.valid_from || now > discount.valid_to) {
      return res.status(400).json({ message: "Mã giảm giá đã hết hạn hoặc chưa bắt đầu." });
    }

    res.status(200).json({
      message: "Mã hợp lệ",
      discount_percent: discount.discount_percent,
      description: discount.description,
    });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
