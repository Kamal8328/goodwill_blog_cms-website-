const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },

    featuredImage: {
      url: String,
      public_id: String,
    },

    content: String,
    excerpt: String,
    author: { type: String, default: "Admin" },

    // MULTI categories (array of ObjectIds)
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    tags: [
      {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Tag"
      }
    ],

    status: {
      type: String,
      enum: ["Draft", "Published", "Scheduled"],
      default: "Draft",
    },

    // SEO moved inside object (correct structure)
    seo: {
      metaTitle: String,
      metaDesc: String,
    },

    views: { type: Number, default: 0 },
    publishedAt: Date,
  },
  { timestamps: true }
);

// Auto set publish date
postSchema.pre("save", function () {
  if (this.status === "Published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
});

postSchema.index({tags:1})
module.exports = mongoose.model("Post", postSchema);
