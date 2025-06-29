const Order = require("../models/order.js");

const getAllOrder = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user_id") 
      .populate("items.product_id", "name price") 
      .sort({ created_at: -1 }); 

    res.status(200).json(orders);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ." });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status, updated_at: new Date() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái:", error);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

module.exports = {
  getAllOrder,
  updateOrderStatus 
};