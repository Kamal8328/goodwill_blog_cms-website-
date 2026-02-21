const express = require("express");
const router = express.Router();
const { loginAdmin, forgotPassword, resetPassword } = require("../controllers/authController");

// Login route
router.post("/login", loginAdmin);

// Forgot password route
router.post("/forgot-password", forgotPassword);

// Reset password route
router.post("/reset-password/:token", resetPassword);

module.exports = router;
