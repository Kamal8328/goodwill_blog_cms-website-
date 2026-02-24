const Post = require("../models/postModel");
const Tag = require("../models/tagModel");
const Media = require("../models/mediaModel"); // Added this import
const mongoose = require("mongoose");
const { uploadToCloudinary, deleteFromCloudinary } = require("../middleware/uploadMiddleware");

/* =============================================
   HELPER: Sync Tags
============================================= */
const syncTags = async (tagNames = []) => {
  const tagIds = [];
  for (let name of tagNames) {
    const normalized = name.toLowerCase().trim();
    let existingTag = await Tag.findOne({ name: normalized });
    if (!existingTag) {
      existingTag = await Tag.create({ name: normalized });
    }
    tagIds.push(existingTag._id);
  }
  return tagIds;
};

/* =============================================
   1️⃣ GET ALL POSTS
============================================= */
// backend/controllers/postController.js
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("categories", "name slug") // ADD "slug" HERE
      .populate("tags", "name slug")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

/* =============================================
   2️⃣ GET SINGLE POST BY ID
============================================= */
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    const post = await Post.findById(id)
      .populate("categories", "_id name")
      .populate("tags", "_id name slug");
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch post", error: err.message });
  }
};

/* =============================================
   3️⃣ CREATE POST (Fixed with Media Sync)
============================================= */
exports.createPost = async (req, res) => {
  try {
    const { title, slug, content, excerpt, status, categories, tags, metaTitle, metaDescription } = req.body;

    let tagIds = [];
    if (tags) {
      const parsedTags = typeof tags === "string" ? tags.split(",").map(t => t.trim()).filter(Boolean) : tags;
      tagIds = await syncTags(parsedTags);
    }

    let featuredImage = {};
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, "blog");
        featuredImage = { url: result.secure_url, public_id: result.public_id };

        // SYNC TO MEDIA LIBRARY
        await Media.create({
          name: req.file.originalname,
          url: result.secure_url,
          public_id: result.public_id,
          size: req.file.size,
          format: req.file.mimetype,
        });
      } catch (cloudErr) {
        console.error("Cloudinary Failed:", cloudErr.message);
      }
    }

    const post = await Post.create({
      title,
      slug,
      content,
      excerpt,
      status,
      categories: categories ? (Array.isArray(categories) ? categories : [categories]) : [],
      tags: tagIds,
      featuredImage,
      seo: { metaTitle, metaDesc: metaDescription },
    });

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: "Failed to create post", error: error.message });
  }
};

/* =============================================
   4️⃣ UPDATE POST (Syntax Error Fixed Here)
============================================= */
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (req.file) {
      try {
        if (post.featuredImage?.public_id) {
          await deleteFromCloudinary(post.featuredImage.public_id);
        }
        const result = await uploadToCloudinary(req.file.buffer, "blog");
        post.featuredImage = { url: result.secure_url, public_id: result.public_id };

        // SYNC TO MEDIA LIBRARY
        await Media.create({
          name: req.file.originalname,
          url: result.secure_url,
          public_id: result.public_id,
          size: req.file.size,
          format: req.file.mimetype,
        });
      } catch (err) {
        console.error("Image Update Failed:", err.message);
      }
    }

    if (req.body.tags) {
      const parsedTags = typeof req.body.tags === "string" ? JSON.parse(req.body.tags) : req.body.tags;
      const tagNames = parsedTags.map(t => typeof t === 'object' ? t.name : t);
      post.tags = await syncTags(tagNames);
    }

    post.title = req.body.title || post.title;
    post.slug = req.body.slug || post.slug;
    post.content = req.body.content || post.content;
    post.excerpt = req.body.excerpt || post.excerpt;
    post.status = req.body.status || post.status;
    post.categories = req.body.categories || post.categories;
    post.seo = {
      metaTitle: req.body.metaTitle || post.seo?.metaTitle || "",
      metaDesc: req.body.metaDescription || post.seo?.metaDesc || "",
    };

    await post.save();
    res.json({ message: "Post updated successfully", post });
  } catch (err) {
    res.status(500).json({ message: "Failed to update post" });
  }
};

/* =============================================
   5️⃣ DELETE POST
============================================= */
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.featuredImage?.public_id) {
      await deleteFromCloudinary(post.featuredImage.public_id);
    }

    await post.deleteOne();
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete post" });
  }
};


/* =============================================
   6️⃣ GET POST BY SLUG
============================================= */
exports.getPostBySlug = async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
      .populate("categories", "name")
      .populate("tags", "name slug");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch post" });
  }
};

/* =============================================
   7️⃣ GET POSTS BY TAG
============================================= */
exports.getPostsByTag = async (req, res) => {
  try {
    const tag = await Tag.findOne({ slug: req.params.slug });

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    const posts = await Post.find({ tags: tag._id })
      .populate("categories", "name")
      .populate("tags", "name slug")
      .sort({ createdAt: -1 });

    res.json({
      tag: tag.name,
      totalPosts: posts.length,
      posts,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch posts by tag" });
  }
};