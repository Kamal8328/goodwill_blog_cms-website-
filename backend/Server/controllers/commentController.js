const Comment = require("../models/commentModel");

// CREATE COMMENT
exports.createComment = async (req, res) => {
  try {
    const { blogId, name, email, phone, address, date, message } = req.body;

    const comment = await Comment.create({
      blogId,
      name,
      email,
      phone,
      address,
      date,
      message
    });

    res.status(201).json({
      success: true,
      data: comment
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit comment"
    });
  }
};


// GET ALL COMMENTS
exports.getAllComments = async (req, res) => {

  try {

    const comments = await Comment.find()
      .populate("blogId", "title slug")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: comments
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Error fetching comments"
    });

  }

};


// GET COMMENTS BY BLOG
exports.getCommentsByBlogId = async (req, res) => {

  try {

    const { blogId } = req.params;

    const comments = await Comment.find({ blogId })
      .populate("blogId", "title slug")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: comments
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Error fetching comments"
    });

  }

};


// DELETE COMMENT
exports.deleteComment = async (req, res) => {

  try {

    const { id } = req.params;

    await Comment.findByIdAndDelete(id);

    res.json({
      success: true,
      message: "Comment deleted"
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: "Delete failed"
    });

  }

};