const Client = require("../models/clientModel");
// const nodemailer = require("nodemailer");

// const Client = require("../models/clientModel");

// 1️⃣ Submit Contact (POST) — Database Only
exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, city } = req.body;

    // Basic validation (optional but recommended)
    if (!name || !email || !phone || !city) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const newClient = await Client.create({
      name,
      email,
      phone,
      city,
    });

    res.status(201).json({
      success: true,
      message: "Lead captured successfully!",
      data: newClient,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// 2️⃣ Get Clients (GET)
exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.status(200).json(clients);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error fetching clients",
    });
  }
};