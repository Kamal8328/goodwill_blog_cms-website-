const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    public_id: { type: String, required: true }, // Needed to delete from Cloudinary
    size: { type: Number },
    format: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Media", mediaSchema);