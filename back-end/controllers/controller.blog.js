const Blog = require("../models/BlogModel");
const Trail = require("../models/TrailModel");

const feedQuery = () =>
  Blog.find()
    .sort({ createdAt: -1 })
    .populate("user", "username pic")
    .populate("trail", "name location difficulty length elevation");

const getAllBlogs = async (req, res) => {
  try {
    const blogs = await feedQuery();
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("user", "username pic")
      .populate("trail", "name location difficulty length elevation");
    if (!blog) {
      return res.status(404).json({ message: "The journal cannot be found." });
    }
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBlogsByTrail = async (req, res) => {
  try {
    const blogs = await Blog.find({ trail: req.params.trailId })
      .sort({ createdAt: -1 })
      .populate("user", "username pic")
      .populate("trail", "name location difficulty");
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBlogsByUser = async (req, res) => {
  try {
    const blogs = await Blog.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate("user", "username pic")
      .populate("trail", "name location difficulty");
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createBlog = async (req, res) => {
  try {
    const { title, trail, content } = req.body;
    if (!title || !trail || !content) {
      return res
        .status(400)
        .json({ message: "Title, trail, and journal text are required." });
    }

    const trailDoc = await Trail.findById(trail);
    if (!trailDoc) {
      return res.status(404).json({ message: "That trail does not exist." });
    }

    const tags = Array.isArray(req.body.tags)
      ? req.body.tags
      : String(req.body.tags || "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);

    const blog = await Blog.create({
      title,
      trail,
      content,
      user: req.user._id,
      images: req.body.images || [],
      conditions: req.body.conditions || "",
      difficulty: req.body.difficulty || "",
      distanceKm: req.body.distanceKm || undefined,
      elevationM: req.body.elevationM || undefined,
      durationMinutes: req.body.durationMinutes || undefined,
      tags,
    });

    const populated = await Blog.findById(blog._id)
      .populate("user", "username pic")
      .populate("trail", "name location difficulty length elevation");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBlog = async (req, res) => {
  try {
    const existing = await Blog.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "The journal cannot be found." });
    }
    if (String(existing.user) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only edit your own journal." });
    }
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("user", "username pic")
      .populate("trail", "name location difficulty");
    res.status(200).json(blog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteBlog = async (req, res) => {
  try {
    const existing = await Blog.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: "The journal cannot be found." });
    }
    if (String(existing.user) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ message: "You can only delete your own journal." });
    }
    await existing.deleteOne();
    res.status(200).json({ message: "Journal successfully deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBlog,
  updateBlog,
  deleteBlog,
  getAllBlogs,
  getBlogById,
  getBlogsByTrail,
  getBlogsByUser,
};
