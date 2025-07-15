const Order = require("../models/order.js");
const Product = require("../models/product");
const Cart = require("../models/cart.js");
const Review = require("../models/review.js");

const getAllOrder = async (req, res) => {
  try {
    const { startDate, endDate, status, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    
    // Lọc theo ngày
    if (startDate || endDate) {
      filter.created_at = {};
      if (startDate) {
        filter.created_at.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.created_at.$lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }
    
    // Lọc theo trạng thái
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("user_id", "full_name email phone") 
        .populate("items.product_id", "name price images") 
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter)
    ]);

    res.status(200).json({
      orders,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
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
    const { startDate, endDate, status, page = 1, limit = 10 } = req.query;
    
    let filter = { user_id };
    
    // Lọc theo ngày
    if (startDate || endDate) {
      filter.created_at = {};
      if (startDate) {
        filter.created_at.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.created_at.$lte = new Date(endDate + 'T23:59:59.999Z');
      }
    }
    
    // Lọc theo trạng thái
    if (status) {
      filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate("items.product_id", "name price images")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter)
    ]);

    // Kiểm tra xem user đã review sản phẩm nào chưa
    const ordersWithReviewStatus = await Promise.all(
      orders.map(async (order) => {
        const itemsWithReviewStatus = await Promise.all(
          order.items.map(async (item) => {
            const existingReview = await Review.findOne({
              user_id,
              product_id: item.product_id._id
            });
            return {
              ...item.toObject(),
              hasReviewed: !!existingReview
            };
          })
        );
        return {
          ...order.toObject(),
          items: itemsWithReviewStatus
        };
      })
    );

    res.status(200).json({
      orders: ordersWithReviewStatus,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error("Lỗi khi lấy đơn hàng của user:", err);
    res.status(500).json({ message: "Lỗi máy chủ." });
  }
};

module.exports = {
  getAllOrder,
  updateOrderStatus,
  createOrder,
  getOrdersByUser
};
