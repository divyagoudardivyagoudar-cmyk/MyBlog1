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
  getAuthorDashboard,
} from "../controllers/blogController.js";
import { authenticateJWT, optionalAuthenticateJWT } from "../middleware/auth.js";

const router = Router();

// Public read endpoints
router.get("/categories", getCategories);
router.get("/", getBlogs);

// Private Author Dashboard (Protected - MUST precede /:id)
router.get("/author/dashboard", authenticateJWT, getAuthorDashboard);

// Public single post read
router.get("/:id", getBlogById);

// Protected creator actions (Strict JWT required)
router.post("/", authenticateJWT, createBlog);
router.put("/:id", authenticateJWT, updateBlog);
router.delete("/:id", authenticateJWT, deleteBlog);

// Social actions
router.post("/:id/like", likeBlog);
router.post("/:id/comments", optionalAuthenticateJWT, addComment);

export default router;

