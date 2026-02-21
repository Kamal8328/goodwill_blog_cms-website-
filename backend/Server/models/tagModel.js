const mongoose = require("mongoose");

const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

const tagSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique:true,
      lowercase:true
    },
    slug: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Auto-generate slug before saving
tagSchema.pre("save",function () {
  if (this.isModified("name")) {
    this.slug = slugify(this.name);
  }
});

tagSchema.index({slug:1})

module.exports = mongoose.model("Tag", tagSchema);