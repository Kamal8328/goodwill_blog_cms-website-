const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const adminProtect = require("../middleware/adminMiddleware");
const { upload } = require("../middleware/uploadMiddleware");

const {
  uploadMedia,
  getMedia,
  deleteMedia,
} = require("../controllers/mediaController");

router.post("/", protect, adminProtect, upload.single("file"), uploadMedia);
router.get("/", protect, adminProtect, getMedia);
router.delete("/:id", protect, adminProtect, deleteMedia);

module.exports = router;
