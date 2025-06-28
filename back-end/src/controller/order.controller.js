const Order = require("../models/order.js");

const getAllOrder = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user_id", "full_name email") 
      .populate("items.product_id", "name price") 
      .sort({ created_at: -1 }); 

    res.status(200).json(orders);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

module.exports = {
  getAllOrder
};
