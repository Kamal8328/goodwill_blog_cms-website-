const Post = require("../models/postModel");

const incrementViews = async (req, res, next) => {
  try {
    const { slug } = req.params;

    if (!slug) return next();

    await Post.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { new: true }
    );

    next();
  } catch (error) {
    console.error("View increment failed:", error);
    next(); // never block page loading
  }
};

module.exports = incrementViews;
