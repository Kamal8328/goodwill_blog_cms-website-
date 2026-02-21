const Tag = require("../models/tagModel.js")
const Post = require("../models/postModel.js")



/**
 * @desc Get all tags with post count
 * @route GET /api/tags
 * @access Admin
 */
const getTags = async (req, res) => {
  try {
    const tags = await Tag.aggregate([
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "tags",
          as: "posts",
        },
      },
      {
        $project: {
          name: 1,
          slug: 1,
          postCount: { $size: "$posts" },
        },
      },
      { $sort: { name: 1 } },
    ]);

    res.status(200).json(tags);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tags" });
  }
};

/**
 * @desc Update tag name
 * @route PUT /api/tags/:id
 * @access Admin
 */
const updateTag = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Tag name is required" });
    }

    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    tag.name = name.trim();
    await tag.save(); // slug auto-updates in pre-save

    res.status(200).json(tag);
  } catch (error) {
    res.status(500).json({ message: "Failed to update tag" });
  }
};

/**
 * @desc Delete tag
 * @route DELETE /api/tags/:id
 * @access Admin
 */
const deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    // Remove tag reference from posts
    await Post.updateMany(
      { tags: tag._id },
      { $pull: { tags: tag._id } }
    );

    await tag.deleteOne();

    res.status(200).json({ message: "Tag deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete tag" });
  }
}; 

module.exports={getTags,deleteTag,updateTag}