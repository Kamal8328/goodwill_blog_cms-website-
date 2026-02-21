const express = require("express");
const {getTags,
  updateTag,
  deleteTag} = require("../controllers/tagController.js")

  const protect = require("../middleware/authMiddleware")
  const adminProtect = require("../middleware/adminMiddleware")



const router = express.Router();

router.get("/", protect, adminProtect, getTags);
router.put("/:id", protect, adminProtect, updateTag);
router.delete("/:id", protect, adminProtect, deleteTag);

module.exports = router;

