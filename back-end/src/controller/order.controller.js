const Order = require("../models/order.js");
const Product = require("../models/product");
const Cart = require("../models/cart.js");

const getAllOrder = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user_id")
      .populate("items.product_id", "name price images")
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

const createOrder = async (req, res) => {
  try {
    const { user_id, items, total_amount, shipping_address, payment_method } = req.body;

    // 1. Kiểm tra tồn kho trước
    for (const item of items) {
      const product = await Product.findById(item.product_id);
      if (!product) {
        return res.status(404).json({ message: `Sản phẩm với ID ${item.product_id} không tồn tại.` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Sản phẩm "${product.name}" không đủ hàng trong kho.` });
      }
    }

    // 2. Chống tạo đơn trùng nếu thanh toán PayOS
    if (payment_method === "PayOS") {
      const existed = await Order.findOne({
        user_id,
        total_amount,
        payment_method: "PayOS",
        createdAt: { $gte: new Date(Date.now() - 60 * 1000) }, // trong vòng 1 phút gần nhất
      });

      if (existed) {
        return res.status(200).json({ message: "Đơn hàng đã được tạo trước đó", order: existed });
      }
    }

    // 3. Tạo đơn hàng
    const order = new Order({
      user_id,
      items,
      total_amount,
      shipping_address,
      payment_method,
    });
    await order.save();

    // 4. Trừ số lượng trong kho
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product_id, {
        $inc: { stock: -item.quantity },
      });
    }

    // 5. Xoá giỏ hàng của user
    await Cart.deleteOne({ user_id });

    return res.status(201).json({ message: "Đơn hàng đã được tạo thành công.", order });

  } catch (err) {
    console.error("Lỗi tạo đơn hàng:", err);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

const getOrdersByUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const orders = await Order.find({ user_id })
      .populate("items.product_id", "name price")
      .sort({ created_at: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};



module.exports = {
  getAllOrder,
  updateOrderStatus,
  createOrder,
  getOrdersByUser
};