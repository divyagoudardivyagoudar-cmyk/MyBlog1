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
import { optionalAuthenticateJWT } from "../middleware/auth.js";

const router = Router();

router.get("/categories", getCategories);
router.get("/", getBlogs);
router.get("/:id", getBlogById);
router.post("/", optionalAuthenticateJWT, createBlog);
router.put("/:id", optionalAuthenticateJWT, updateBlog);
router.delete("/:id", optionalAuthenticateJWT, deleteBlog);
router.post("/:id/like", likeBlog);
router.post("/:id/comments", addComment);

export default router;

