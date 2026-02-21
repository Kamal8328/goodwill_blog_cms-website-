const express = require("express");
const router = express.Router();
const { getCategories, updateCategory,createCategory, deleteCategory } = require("../controllers/categoryController");
const protect = require("../middleware/authMiddleware"); // Secure these routes

router.get("/", getCategories);
router.post("/", protect, createCategory);
router.put("/:id",protect,updateCategory);
router.delete("/:id", protect, deleteCategory);

module.exports = router;