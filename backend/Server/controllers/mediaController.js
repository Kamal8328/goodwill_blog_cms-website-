const Media = require("../models/mediaModel");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../middleware/uploadMiddleware");

// Upload media
const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    if (!result || !result.secure_url) {
      return res.status(500).json({ message: "Cloudinary upload failed" });
    }

    const media = await Media.create({
      name: req.file.originalname,
      url: result.secure_url,
      public_id: result.public_id,
      size: req.file.size,
      format: result.format,
    });

    res.status(201).json(media);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Upload failed" });
  }
};

// Get all media
const getMedia = async (req, res) => {
  try {
    const media = await Media.find().sort({ createdAt: -1 });
    res.status(200).json(media);
  } catch (error) {
    console.error("Fetch media error:", error);
    res.status(500).json({ message: "Failed to fetch media" });
  }
};

// Delete media
const deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    await deleteFromCloudinary(media.public_id);
    await media.deleteOne();

    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    console.error("Delete media error:", error);
    res.status(500).json({ message: "Delete failed" });
  }
};

module.exports = {
  uploadMedia,
  getMedia,
  deleteMedia,
};