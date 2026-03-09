const express = require("express");
const router = express.Router();

const {
  createComment,
  getAllComments,
  getCommentsByBlogId,
  deleteComment
} = require("../controllers/commentController");


// create comment
router.post("/comments", createComment);

// admin - get all comments
router.get("/comments", getAllComments);

// get comments by blog
router.get("/comments/:blogId", getCommentsByBlogId);

// delete
router.delete("/comments/:id", deleteComment);

module.exports = router;