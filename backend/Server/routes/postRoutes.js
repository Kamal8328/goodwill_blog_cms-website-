const express = require("express");
const router = express.Router();

const {
  createPost,
  getPosts,
  getPostById,
  getPostBySlug,
  updatePost,
  deletePost,
  getPostsByTag
} = require("../controllers/postController");

const protect = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");
const incrementViews = require("../middleware/incrementViews");

/* ==============================
   PUBLIC ROUTES
============================== */

// 1️⃣ Get all posts
router.get("/", getPosts);

// 2️⃣ Get post by SLUG (must come BEFORE :id)
router.get("/slug/:slug", incrementViews, getPostBySlug);

router.get("/tag/:slug",getPostsByTag)
// 3️⃣ Get post by ID
router.get("/:id", getPostById);

// 4️⃣ Create post
router.post("/", protect, upload.single("featuredImage"), createPost);

// 5️⃣ Update post
router.put("/:id", protect, upload.single("featuredImage"), updatePost);

// 6️⃣ Delete post
router.delete("/:id", protect, deletePost);

module.exports = router;
