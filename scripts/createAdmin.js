require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("../models/Admin");

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to DB");

  const email = "ravikirankumarraju6068@gmail.com";
  const password = process.argv[2];  // <-- SAFE: password is typed in terminal

  if (!password) {
    console.log("❌ Please enter password:  node scripts/createAdmin.js <password>");
    process.exit(1);
  }

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log("⚠️ Admin already exists with this email.");
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await Admin.create({ email, passwordHash });

  console.log("✅ Admin created successfully:", email);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
