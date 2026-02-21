const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Admin = require("./models/adminModel"); // Ensure this path matches your model file
const connectDB = require("./config/db"); // Ensure this path matches your db config

dotenv.config();

// Connect to DB
connectDB();

const createAdmin = async () => {
  try {
    // 1. Check if admin already exists to prevent duplicates
    const existingAdmin = await Admin.findOne({ email: "admin@example.com" });
    
    if (existingAdmin) {
      console.log("⚠️  Admin user already exists.");
      process.exit();
    }

    // 2. Create the Admin
    // Note: Your adminModel.js has a 'pre-save' hook that will automatically hash this password.
    const admin = await Admin.create({
      name: "Super Admin",
      email: "admin@example.com",
      password: "password123" 
    });

    console.log("✅ Admin User Created Successfully!");
    console.log("-----------------------------------");
    console.log("Email:    admin@example.com");
    console.log("Password: password123");
    console.log("-----------------------------------");

    process.exit();
  } catch (error) {
    console.error("❌ Error creating admin:", error.message);
    process.exit(1);
  }
};

createAdmin();