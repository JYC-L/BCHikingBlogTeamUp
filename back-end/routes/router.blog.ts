import { Router } from "express";
import {
  createBlog,
  deleteBlog,
  getAllBlogs,
  getBlogById,
  getBlogsByTrail,
  getBlogsByUser,
  updateBlog,
} from "../controllers/controller.blog";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/", getAllBlogs);
router.get("/trail/:trailId", getBlogsByTrail);
router.get("/user/:userId", getBlogsByUser);
router.get("/:id", getBlogById);
router.post("/", protect, createBlog);
router.put("/:id", protect, updateBlog);
router.delete("/:id", protect, deleteBlog);

export default router;
