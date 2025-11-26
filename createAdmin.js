const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");

const MONGO_URI = "mongodb+srv://revathiparisarla_db_user:6wFuAOhjH2gqwqYC@cluster0.9ysf2x5.mongodb.net/selling_laptop?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    // 🧹 Remove any existing admin with same email to avoid duplicates
    await Admin.deleteMany({ email: "admin@gmail.com" });

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash("admin123@", 10);

    // 🆕 Create admin
    await Admin.create({
      email: "admin@gmail.com",
      passwordHash: hashedPassword,
    });

    console.log("✅ Admin created successfully!");
    console.log("📧 Email: admin@gmail.com");
    console.log("🔑 Password: admin123@");

    mongoose.connection.close();
  })
  .catch(err => console.error("❌ Error creating admin:", err));
