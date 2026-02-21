const express = require("express");
const router = express.Router();
const { getDashboardAnalytics } = require("../controllers/analyticsController");
const adminProtect = require("../middleware/adminMiddleware");

// 🔐 PROTECTED ROUTE
router.get("/dashboard", adminProtect, getDashboardAnalytics);

module.exports = router;
