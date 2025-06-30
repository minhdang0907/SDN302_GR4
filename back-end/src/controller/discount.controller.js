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

// Thêm
exports.createDiscount = async (req, res) => {
  try {
    const discount = new Discount(req.body);
    await discount.save();
    res.status(201).json(discount);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Sửa
exports.updateDiscount = async (req, res) => {
  try {
    const discount = await Discount.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!discount) return res.status(404).json({ error: "Không tìm thấy mã giảm giá" });
    res.json(discount);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Xoá
exports.deleteDiscount = async (req, res) => {
  try {
    const result = await Discount.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: "Không tìm thấy mã giảm giá" });
    res.json({ message: "Đã xoá thành công" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy tất cả
exports.getAllDiscounts = async (req, res) => {
  try {
    const list = await Discount.find().sort({ valid_to: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};