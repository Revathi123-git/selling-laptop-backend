const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const adminAuth = require("../middleware/adminAuth"); // ✅ import middleware

// ✅ Admin Login Route with JWT
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    // Find admin in DB
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: "Invalid email or password" });

    // Compare password
    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    // Generate JWT token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "2h" } // token valid for 2 hours
    );

    // Send token to frontend
    res.status(200).json({ token, email: admin.email });

  } catch (error) {
    console.error("🔥 Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Example: Dashboard data (protected)
router.get("/dashboard-data", adminAuth, (req, res) => {
  // req.admin contains info from JWT
  res.json({ msg: "Secret admin data only for logged-in admins" });
});

// Another protected route example
router.get("/admin-settings", adminAuth, (req, res) => {
  res.json({ msg: "Admin settings data" });
});


module.exports = router;
