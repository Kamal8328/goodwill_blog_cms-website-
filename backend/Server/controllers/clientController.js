const Client = require("../models/clientModel");
const nodemailer = require("nodemailer");

// 1. Setup the Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 2. Submit Contact (POST)
exports.submitContact = async (req, res) => {
  try {
    const { name, email, phone, city } = req.body;
    const newClient = await Client.create({ name, email, phone, city });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.RECEIVER_MAIL,
      subject: `🔥 New Lead: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nCity: ${city}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json({ 
      success: true, 
      message: "Lead captured!",
      data: newClient 
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// 3. Get Clients (GET) - THIS WAS THE MISSING LINK!
exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.status(200).json(clients);
  } catch (err) {
    res.status(500).json({ success: false, message: "Error fetching clients" });
  }
};