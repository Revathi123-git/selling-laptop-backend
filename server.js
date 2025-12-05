// backend/server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const brandRoutes = require("./routes/brands");
// Routes
const deviceRoutes = require("./routes/device");
const adminRoutes = require("./routes/adminRoutes"); // optional (if admin panel is needed)

const app = express();

app.use(
  cors({
    origin: "https://www.escrapeelectronics.com",
    credentials: true,
  })
);app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/sell_device_db";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", deviceRoutes);
app.use("/api/admin", adminRoutes); // include only if admin auth still used
app.use("/api", brandRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Device Selling API is running...");
});


// ✅ ADD THIS GLOBAL ERROR HANDLER HERE
app.use((err, req, res, next) => {
  console.error("❌ Multer or upload error:", err);
  res.status(400).json({ error: err.message });
});


// ✅ Keep this at the end
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running successfully on port ${PORT}`)
);
