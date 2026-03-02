const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Admin = require("./models/adminModel");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const createAdmin = async () => {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log("⚠️ Admin already exists.");
      process.exit();
    }

    const admin = await Admin.create({
      name: "Super Admin",
      email,
      password,
    });

    console.log("✅ Super Admin Created Successfully!");
    console.log("-----------------------------------");
    console.log("Email:    goodwilloverseas88@gmail.com");
    console.log("Password: goodwill@88");
    console.log("-----------------------------------");

    process.exit();
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
};

createAdmin();