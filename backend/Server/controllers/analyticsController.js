const Post = require("../models/postModel");
const Category = require("../models/categoryModel");
const Tag = require("../models/tagModel");
const Media = require("../models/mediaModel");

exports.getDashboardAnalytics = async (req, res) => {
  try {
    /* BASIC COUNTS */
    const totalPosts = await Post.countDocuments();
    const publishedPosts = await Post.countDocuments({ status: "Published" });
    const draftPosts = await Post.countDocuments({ status: "Draft" });
    const scheduledPosts = await Post.countDocuments({ status: "Scheduled" });

    const categoriesCount = await Category.countDocuments();
    const tagsCount = await Tag.countDocuments();
    const mediaCount = await Media.countDocuments();

    /* TOTAL VIEWS */
    const viewsData = await Post.aggregate([
      { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);
    const totalViews = viewsData[0]?.totalViews || 0;

    /* RECENT POSTS (for dashboard activity) */
    const recentPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title slug views status createdAt");

    res.json({
      stats: {
        totalPosts,
        publishedPosts,
        draftPosts,
        scheduledPosts,
        categoriesCount,
        tagsCount,
        mediaCount,
        totalViews
      },
      recentPosts
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Analytics failed" });
  }
};
