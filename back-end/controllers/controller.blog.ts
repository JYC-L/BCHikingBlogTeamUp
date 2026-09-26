import { Request, Response } from "express";
import Blog from "../models/BlogModel";
import Trail, { Difficulty } from "../models/TrailModel";
import { errorMessage } from "../types/errors";

type JournalBody = {
  title?: string;
  trail?: string;
  content?: string;
  images?: string[];
  conditions?: string;
  difficulty?: Difficulty | "";
  distanceKm?: number;
  elevationM?: number;
  durationMinutes?: number;
  tags?: string[] | string;
};

const feedPopulate = [
  { path: "user", select: "username pic" },
  { path: "trail", select: "name location difficulty length elevation" },
];

export const getAllBlogs = async (_req: Request, res: Response): Promise<void> => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).populate(feedPopulate);
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: errorMessage(error) });
  }
};

export const getBlogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const blog = await Blog.findById(req.params.id).populate(feedPopulate);
    if (!blog) {
      res.status(404).json({ message: "The journal cannot be found." });
      return;
    }
    res.status(200).json(blog);
  } catch (error) {
    res.status(500).json({ message: errorMessage(error) });
  }
};

export const getBlogsByTrail = async (req: Request, res: Response): Promise<void> => {
  try {
    const blogs = await Blog.find({ trail: req.params.trailId })
      .sort({ createdAt: -1 })
      .populate([
        { path: "user", select: "username pic" },
        { path: "trail", select: "name location difficulty" },
      ]);
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: errorMessage(error) });
  }
};

export const getBlogsByUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const blogs = await Blog.find({ user: req.params.userId })
      .sort({ createdAt: -1 })
      .populate([
        { path: "user", select: "username pic" },
        { path: "trail", select: "name location difficulty" },
      ]);
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: errorMessage(error) });
  }
};

export const createBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Please log in first." });
      return;
    }
    const body = req.body as JournalBody;
    if (!body.title || !body.trail || !body.content) {
      res.status(400).json({ message: "Title, trail, and journal text are required." });
      return;
    }

    const trailDoc = await Trail.findById(body.trail);
    if (!trailDoc) {
      res.status(404).json({ message: "That trail does not exist." });
      return;
    }

    const tags = Array.isArray(body.tags)
      ? body.tags
      : String(body.tags || "")
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);

    const blog = await Blog.create({
      title: body.title,
      trail: body.trail,
      content: body.content,
      user: req.user._id,
      images: body.images || [],
      conditions: body.conditions || "",
      difficulty: body.difficulty || "",
      distanceKm: body.distanceKm || undefined,
      elevationM: body.elevationM || undefined,
      durationMinutes: body.durationMinutes || undefined,
      tags,
    });

    const populated = await Blog.findById(blog._id).populate(feedPopulate);
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: errorMessage(error) });
  }
};

export const updateBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Please log in first." });
      return;
    }
    const existing = await Blog.findById(req.params.id);
    if (!existing) {
      res.status(404).json({ message: "The journal cannot be found." });
      return;
    }
    if (String(existing.user) !== String(req.user._id)) {
      res.status(403).json({ message: "You can only edit your own journal." });
      return;
    }
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate([
      { path: "user", select: "username pic" },
      { path: "trail", select: "name location difficulty" },
    ]);
    res.status(200).json(blog);
  } catch (error) {
    res.status(400).json({ message: errorMessage(error) });
  }
};

export const deleteBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Please log in first." });
      return;
    }
    const existing = await Blog.findById(req.params.id);
    if (!existing) {
      res.status(404).json({ message: "The journal cannot be found." });
      return;
    }
    if (String(existing.user) !== String(req.user._id)) {
      res.status(403).json({ message: "You can only delete your own journal." });
      return;
    }
    await existing.deleteOne();
    res.status(200).json({ message: "Journal successfully deleted." });
  } catch (error) {
    res.status(500).json({ message: errorMessage(error) });
  }
};
