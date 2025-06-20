const express = require("express");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 9999;

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

// Import các route
const userRoutes = require("./src/routes/user.route");
const indexRoutes = require("./src/routes/index");

app.use("/api/users", userRoutes);   // login, register
app.use("/", indexRoutes);           // /products, /categories

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
