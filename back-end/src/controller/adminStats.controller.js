const Product = require("../models/product");
const Order = require("../models/order");
const User = require("../models/user");

exports.getStats = async (req, res) => {
    try {
        const [products, orders, users] = await Promise.all([
            Product.countDocuments(),
            Order.countDocuments(),
            User.countDocuments(),
        ]);
        // Tổng doanh thu (nếu có trường total_amount trong Order)
        const revenueAgg = await Order.aggregate([
            { $group: { _id: null, total: { $sum: "$total_amount" } } }
        ]);
        const revenue = revenueAgg[0]?.total || 0;

        res.json({ products, orders, users, revenue });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};