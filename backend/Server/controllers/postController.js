const Post = require("../models/postModel");
const Tag = require("../models/tagModel");
const { uploadToCloudinary, deleteFromCloudinary } = require("../middleware/uploadMiddleware");

/* =============================================
   HELPER: Sync Tags (Create if not exists)
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
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("categories", "name")
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
    const post = await Post.findById(req.params.id)
      .populate("categories", "_id name")
      .populate("tags", "_id name slug");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch post" });
  }
};

/* =============================================
   3️⃣ GET POST BY SLUG
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
   4️⃣ GET POSTS BY TAG SLUG
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

/* =============================================
   5️⃣ CREATE POST
============================================= */
exports.createPost = async (req, res) => {
  console.log("===CREATE POST CALLED===");
  console.log("REQ.FILE.EXISTS", !!req.file);
  if(req.file){
    console.log("File name", req.file.original);
    console.log("File size", req.file.size);
    console.log("File type", req.file.mimetype);
  
  }else{
    console.log("No file received by multer");
    }
    console.log("req.body keys:", Object.keys(req.body));
  console.log("[createPost] Request body:", req.body);
  console.log("[createPost] Request body:", req.body);
  
  try {
    console.log("[createPost] Request body:", req.body);
    console.log("[createPost] Has file?", !!req.file);
    if (req.file) {
      console.log("[createPost] File details:", {
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype
      });
    }

    const {
      title,
      slug,
      content,
      excerpt,
      status,
      categories,
      tags,
      metaTitle,
      metaDescription,
    } = req.body;

    // TAGS PARSING (already good)
    let tagIds = [];
    if (tags) {
      const parsedTags =
        typeof tags === "string" ? tags.split(",").map(t => t.trim()).filter(Boolean) : tags;
      tagIds = await syncTags(parsedTags);
    }

    // FEATURED IMAGE – SAFE VERSION
    let featuredImage = {};
    if (req.file) {
      try {
        console.log("[createPost] Starting Cloudinary upload...");
        const result = await uploadToCloudinary(req.file.buffer, "blog");
        console.log("[createPost] Cloudinary success:", result.secure_url);
        featuredImage = { url: result.secure_url, public_id: result.public_id };
      } catch (cloudErr) {
        console.error("[createPost] Cloudinary FAILED:", cloudErr.message || cloudErr);
        // Continue without image - don't crash the whole request
        featuredImage = {};
      }
    } else {
      console.log("[createPost] No image file received");
    }

    // Create post
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

    console.log("[createPost] Post created successfully:", post._id);
    res.status(201).json(post);
  } catch (error) {
    console.error("[createPost] FULL CRASH:", error.stack || error);
    res.status(500).json({ 
      message: "Failed to create post", 
      error: error.message || "Unknown server error"
    });
  }
};
/* =============================================
   6️⃣ UPDATE POST
============================================= */
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Image replacement
    if (req.file) {
      if (post.featuredImage?.public_id) {
        await deleteFromCloudinary(post.featuredImage.public_id);
      }

      const result = await uploadToCloudinary(req.file.buffer, "blog");

      post.featuredImage = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    // Tag sync
    if (req.body.tags) {
      const parsedTags =
        typeof req.body.tags === "string"
          ? JSON.parse(req.body.tags)
          : req.body.tags;

      post.tags = await syncTags(parsedTags);
    }

    // Normal fields
    post.title = req.body.title || post.title;
    post.slug = req.body.slug || post.slug;
    post.content = req.body.content || post.content;
    post.excerpt = req.body.excerpt || post.excerpt;
    post.status = req.body.status || post.status;
    post.categories = req.body.categories || post.categories;

    post.seo = {
      metaTitle: req.body.metaTitle || "",
      metaDesc: req.body.metaDescription || "",
    };

    await post.save();

    res.json({ message: "Post updated successfully", post });
  } catch (err) {
    res.status(500).json({ message: "Failed to update post" });
  }
};

/* =============================================
   7️⃣ DELETE POST
============================================= */
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const tagIds = post.tags;

    if (post.featuredImage?.public_id) {
      await deleteFromCloudinary(post.featuredImage.public_id);
    }

    await post.deleteOne();

    // Remove unused tags
    for (let tagId of tagIds) {
      const count = await Post.countDocuments({ tags: tagId });

      if (count === 0) {
        await Tag.findByIdAndDelete(tagId);
      }
    }

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete post" });
  }
};