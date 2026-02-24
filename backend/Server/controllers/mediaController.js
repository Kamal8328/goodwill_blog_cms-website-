const Media = require("../models/mediaModel");
const { uploadToCloudinary, deleteFromCloudinary } = require("../middleware/uploadMiddleware");

// Get all media files
exports.getMedia = async (req, res) => {
  try {
    const media = await Media.find();
    console.log("Media found in DB:", media.length); // Check your terminal!
    res.json(media);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch media" });
  }
};

// Upload new file to Cloudinary and DB
exports.uploadMedia = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const result = await uploadToCloudinary(req.file.buffer, "media-library");

    const newMedia = await Media.create({
      name: req.file.originalname,
      url: result.secure_url,
      public_id: result.public_id,
      size: req.file.size,
      format: req.file.mimetype,
    });

    res.status(201).json(newMedia);
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};

// Delete from both Cloudinary and DB
exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ message: "File not found" });

    await deleteFromCloudinary(media.public_id);
    await media.deleteOne();

    res.json({ message: "File deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Deletion failed" });
  }
};