import { Router } from "express";
import {
  getBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  addComment,
  getCategories,
} from "../controllers/blogController.js";
import { authenticateJWT } from "../middleware/auth.js";

const router = Router();

router.get("/categories", getCategories);
router.get("/", getBlogs);
router.get("/:id", getBlogById);
router.post("/", authenticateJWT, createBlog);
router.put("/:id", authenticateJWT, updateBlog);
router.delete("/:id", authenticateJWT, deleteBlog);
router.post("/:id/like", likeBlog);
router.post("/:id/comments", addComment);

export default router;
