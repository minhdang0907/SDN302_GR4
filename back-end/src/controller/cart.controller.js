const Cart = require("../models/cart");
const Product = require("../models/product");
exports.addToCart = async (req, res) => {
  try {
    const { user_id, product_id, quantity } = req.body;

    let cart = await Cart.findOne({ user_id });

    if (!cart) {
      cart = new Cart({
        user_id,
        items: [{ product_id, quantity }],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.product_id.toString() === product_id
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ product_id, quantity });
      }
    }

    cart.updated_at = new Date();
    await cart.save();

    res.status(200).json({ message: "Đã thêm vào giỏ hàng", cart });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const { user_id } = req.params;

    const cart = await Cart.findOne({ user_id }).populate("items.product_id");

    if (!cart) return res.status(404).json({ message: "Không có giỏ hàng" });

    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { user_id, product_id, quantity } = req.body;

    if (!user_id || !product_id || !quantity) {
      return res.status(400).json({ message: "Thiếu thông tin truyền vào." });
    }

    const product = await Product.findById(product_id);
    if (!product || !product.is_available) {
      return res.status(400).json({ message: "Sản phẩm không khả dụng." });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        message: `Chỉ còn ${product.stock} sản phẩm trong kho.`,
      });
    }

    const cart = await Cart.findOne({ user_id });
    if (!cart) return res.status(404).json({ message: "Không có giỏ hàng." });

    const item = cart.items.find(
      (item) => item.product_id.toString() === product_id
    );

    if (!item) return res.status(404).json({ message: "Không tìm thấy sản phẩm trong giỏ." });

    item.quantity = quantity;
    cart.updated_at = new Date();
    await cart.save();

    res.status(200).json({ message: "Cập nhật giỏ hàng thành công", cart });
  } catch (err) {
    console.error("Lỗi updateCartItem:", err.message);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};


exports.removeCartItem = async (req, res) => {
  try {
    const { user_id, product_id } = req.body;

    const cart = await Cart.findOne({ user_id });
    if (!cart) return res.status(404).json({ message: "Không có giỏ hàng" });

    cart.items = cart.items.filter(
      (item) => item.product_id.toString() !== product_id
    );

    cart.updated_at = new Date();
    await cart.save();

    res.status(200).json({ message: "Đã xoá sản phẩm khỏi giỏ", cart });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const { user_id } = req.body;

    const cart = await Cart.findOne({ user_id });
    if (!cart) return res.status(404).json({ message: "Không có giỏ hàng" });

    cart.items = [];
    cart.updated_at = new Date();
    await cart.save();

    res.status(200).json({ message: "Đã xoá toàn bộ giỏ hàng", cart });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
