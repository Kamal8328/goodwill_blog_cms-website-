const express = require("express");
const router = express.Router();
const { submitContact, getClients } = require("../controllers/clientController");
const protect = require("../middleware/authMiddleware");

// Public route (for the website contact form)
router.post("/contact", submitContact);

// Protected route (for Admin Dashboard viewing)
router.get("/", getClients);

module.exports = router;