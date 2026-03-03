const Admin = require("../models/adminModel");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

// ================= LOGIN =================
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Please provide email & password" });

    const admin = await Admin.findOne({ email });

    if (!admin || !(await admin.matchPassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await Admin.findOne({ email });

    if (admin) {
      const resetToken = crypto.randomBytes(20).toString("hex");

      admin.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      admin.resetPasswordExpire = Date.now() + 3600000; // 1 hour
      await admin.save();

      const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

      const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 587,
  secure: false, // IMPORTANT for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    ciphers: "SSLv3",
  },
});
      
      transporter.verify((err, success) => {
  console.log(err || "SMTP CONNECTED");
});
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: admin.email,
        subject: "Password Reset Request",
        html: `
          <h2>Password Reset</h2>
          <p>Click below to reset your password:</p>
          <a href="${resetURL}" target="_blank">${resetURL}</a>
          <p>This link expires in 1 hour.</p>
        `,
      });
    }

    // Always send same message (no email enumeration)
    res.json({ message: "If email exists, reset link sent." });

  } catch(error) {
    console.log("Forgot Password Error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (password.length < 8)
      return res.status(400).json({ message: "Password must be at least 8 characters" });

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const admin = await Admin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!admin)
      return res.status(400).json({ message: "Invalid or expired token" });

    admin.password = password;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpire = undefined;

    await admin.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: error.message });
  }
};