const jwt = require("jsonwebtoken");

const adminAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") return res.status(403).json({ message: "Access denied" });
    req.admin = decoded; // Save admin info to request
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = adminAuth;
