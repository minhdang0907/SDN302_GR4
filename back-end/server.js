const express = require('express');
const connectDB = require('./config/db');
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 9999;

// Kết nối MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: "http://localhost:3001", // hoặc "*" nếu test nhanh
    credentials: true
}));

// Route
const userRoutes = require("./src/routes/user.route"); // 💡 thêm
const indexRoutes = require('./src/routes/index.js');

app.use("/api/users", userRoutes); // 💡 login, register, logout
app.use("/", indexRoutes);          // 💡 các route khác: /products, /categories

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server is running at http://localhost:${PORT}`);
});
