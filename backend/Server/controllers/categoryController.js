const Category = require("../models/categoryModel");
const Post = require("../models/postModel");

/* ---------------------------------------------------
   HELPER: SLUGIFY (backend safety)
--------------------------------------------------- */
const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");


/* ===================================================
   GET ALL CATEGORIES WITH POST COUNT (AGGREGATION)
=================================================== */
// @route GET /api/categories
/* ===================================================
   GET ALL CATEGORIES WITH POST COUNT (FIXED)
=================================================== */
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.aggregate([
      {
        $lookup: {
          from: "posts",
          localField: "_id",
          foreignField: "categories",
          as: "posts"
        }
      },
      {
        $addFields: {
          postCount: { $size: "$posts" }
        }
      },
      {
        $project: {
          posts: 0
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

/* ===================================================
   CREATE CATEGORY
=================================================== */
// @route POST /api/categories
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const slug = slugify(req.body.slug || name);

    if (!name || !slug)
      return res.status(400).json({ message: "Name and slug required" });

    const exists = await Category.findOne({ slug });
    if (exists)
      return res.status(400).json({ message: "Category already exists" });

    const category = await Category.create({
      name,
      slug,
      description
    });

    res.status(201).json(category);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


/* ===================================================
   UPDATE CATEGORY (SAFE SLUG MIGRATION)
=================================================== */
// @route PUT /api/categories/:id
exports.updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const slug = slugify(req.body.slug || name);

    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    const oldSlug = category.slug;

    // check duplicate slug (excluding current category)
    const exists = await Category.findOne({
      slug,
      _id: { $ne: req.params.id }
    });
    if (exists)
      return res.status(400).json({ message: "Slug already in use" });

    // update category document
    category.name = name;
    category.slug = slug;
    category.description = description;
    await category.save();

    /* 🔥 MIGRATE POSTS IF SLUG CHANGED */
    // if (oldSlug !== slug) {
    //   const posts = await Post.find({ categories: oldSlug });

    //   for (const post of posts) {
    //     post.categories = post.categories.map(c =>
    //       c === oldSlug ? slug : c
    //     );
    //     await post.save();
    //   }
    // }

    res.json(category);

  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


/* ===================================================
   DELETE CATEGORY (REMOVE FROM POSTS)
=================================================== */
// @route DELETE /api/categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    const slug = category.slug;

    // remove category slug from all posts
    await Post.updateMany(
  { categories: category._id },
  { $pull: { categories: category._id } }
);

    await category.deleteOne();

    res.json({ message: "Category deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
