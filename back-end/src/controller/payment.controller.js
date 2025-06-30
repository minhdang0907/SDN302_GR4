
require("dotenv").config();
const  PayOS  = require("@payos/node");

const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

exports.createPayOSLink = async (req, res) => {
  try {
    const { amount, description } = req.body;

    const paymentData = await payos.createPaymentLink({
      orderCode: Date.now(), // nên là unique (số)
      amount,
      description,
      cancelUrl: process.env.PAYOS_CANCEL_URL,
      returnUrl: process.env.PAYOS_RETURN_URL,
    });

    return res.json({ checkoutUrl: paymentData.checkoutUrl });
  } catch (err) {
    console.error("PayOS SDK Error:", err);
    return res.status(500).json({ message: "Không thể tạo link thanh toán PayOS" });
  }
};
