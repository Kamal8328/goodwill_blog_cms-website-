const express = require("express");
const router = express.Router();
const { uploadMedia, getMedia, deleteMedia } = require("../controllers/mediaController");
const { upload } = require("../middleware/uploadMiddleware");
const protect = require("../middleware/authMiddleware");

// Protection ensures only logged-in users can manage media
router.use(protect);

router.get("/", getMedia);
router.post("/", upload.single("file"), uploadMedia); // 'file' must match frontend formData
router.delete("/:id", deleteMedia);

module.exports = router;