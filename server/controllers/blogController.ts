import { Request, Response } from "express";
import { getDb } from "../db.js";
import { AuthRequest } from "../middleware/auth.js";
import { BlogPost, Comment } from "../../src/types.js";
import { INITIAL_CATEGORIES } from "../../src/data/initialData.js";

// GET /api/blogs
export const getBlogs = (req: Request, res: Response): void => {
  const { category, search, authorId, status, sort } = req.query;
  const db = getDb();
  let results = [...db.blogs];

  if (status) {
    results = results.filter((b) => b.status === status);
  } else if (!authorId) {
    results = results.filter((b) => b.status === "published");
  }

  if (authorId) {
    results = results.filter((b) => b.authorId === authorId);
  }

  if (category && category !== "all") {
    results = results.filter(
      (b) => b.category.toLowerCase() === (category as string).toLowerCase()
    );
  }

  if (search) {
    const q = (search as string).toLowerCase();
    results = results.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.content.toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q)) ||
        b.authorName.toLowerCase().includes(q)
    );
  }

  if (sort === "popular" || sort === "views") {
    results.sort((a, b) => b.viewsCount - a.viewsCount);
  } else if (sort === "likes") {
    results.sort((a, b) => b.likesCount - a.likesCount);
  } else {
    results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  res.json({
    success: true,
    count: results.length,
    blogs: results,
  });
};

// GET /api/blogs/:id
export const getBlogById = (req: Request, res: Response): void => {
  const { id } = req.params;
  const db = getDb();
  const blog = db.blogs.find((b) => b.id === id);

  if (!blog) {
    res.status(404).json({ success: false, message: "Blog post not found" });
    return;
  }

  blog.viewsCount += 1;
  res.json({ success: true, blog });
};

// POST /api/blogs (Protected)
export const createBlog = (req: AuthRequest, res: Response): void => {
  try {
    const { title, description, content, category, tags, coverImage, status } = req.body;

    if (!title || !content) {
      res.status(400).json({ success: false, message: "Title and content are required." });
      return;
    }

    const db = getDb();
    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const words = content.trim().split(/\s+/).length;
    const readTimeMinutes = Math.max(1, Math.ceil(words / 180));

    const newBlog: BlogPost = {
      id: "blog_" + Date.now(),
      title: title.trim(),
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      description: description?.trim() || content.slice(0, 140) + "...",
      content,
      authorId: req.user!.id,
      authorName: req.user!.name,
      authorAvatar: req.user!.avatar,
      category: category || "Technology",
      tags: Array.isArray(tags) ? tags : ["Tech", "Coding"],
      coverImage:
        coverImage ||
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
      createdAt: formattedDate,
      updatedAt: formattedDate,
      status: status === "draft" ? "draft" : "published",
      likesCount: 0,
      viewsCount: 1,
      readTimeMinutes,
      comments: [],
    };

    db.blogs.unshift(newBlog);

    res.status(201).json({
      success: true,
      message: newBlog.status === "published" ? "Blog published successfully!" : "Blog saved as draft.",
      blog: newBlog,
    });
  } catch (error) {
    console.error("Create blog error:", error);
    res.status(500).json({ success: false, message: "Failed to create blog post." });
  }
};

// PUT /api/blogs/:id (Protected)
export const updateBlog = (req: AuthRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDb();
  const blogIndex = db.blogs.findIndex((b) => b.id === id);

  if (blogIndex === -1) {
    res.status(404).json({ success: false, message: "Blog post not found." });
    return;
  }

  const existingBlog = db.blogs[blogIndex];
  if (existingBlog.authorId !== req.user!.id) {
    res.status(403).json({ success: false, message: "You are not authorized to edit this post." });
    return;
  }

  const { title, description, content, category, tags, coverImage, status } = req.body;
  const formattedDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const updatedContent = content !== undefined ? content : existingBlog.content;
  const words = updatedContent.trim().split(/\s+/).length;
  const readTimeMinutes = Math.max(1, Math.ceil(words / 180));

  db.blogs[blogIndex] = {
    ...existingBlog,
    title: title !== undefined ? title.trim() : existingBlog.title,
    description: description !== undefined ? description.trim() : existingBlog.description,
    content: updatedContent,
    category: category || existingBlog.category,
    tags: Array.isArray(tags) ? tags : existingBlog.tags,
    coverImage: coverImage || existingBlog.coverImage,
    status: status || existingBlog.status,
    updatedAt: formattedDate,
    readTimeMinutes,
  };

  res.json({
    success: true,
    message: "Blog updated successfully.",
    blog: db.blogs[blogIndex],
  });
};

// DELETE /api/blogs/:id (Protected)
export const deleteBlog = (req: AuthRequest, res: Response): void => {
  const { id } = req.params;
  const db = getDb();
  const blogIndex = db.blogs.findIndex((b) => b.id === id);

  if (blogIndex === -1) {
    res.status(404).json({ success: false, message: "Blog post not found." });
    return;
  }

  const existingBlog = db.blogs[blogIndex];
  if (existingBlog.authorId !== req.user!.id) {
    res.status(403).json({ success: false, message: "You are not authorized to delete this post." });
    return;
  }

  db.blogs.splice(blogIndex, 1);
  res.json({ success: true, message: "Blog post deleted successfully." });
};

// POST /api/blogs/:id/like
export const likeBlog = (req: Request, res: Response): void => {
  const { id } = req.params;
  const db = getDb();
  const blog = db.blogs.find((b) => b.id === id);

  if (!blog) {
    res.status(404).json({ success: false, message: "Blog post not found." });
    return;
  }

  blog.likesCount += 1;
  res.json({
    success: true,
    likesCount: blog.likesCount,
    message: "Post liked.",
  });
};

// POST /api/blogs/:id/comments
export const addComment = (req: Request, res: Response): void => {
  const { id } = req.params;
  const { content, authorName, authorEmail, authorAvatar } = req.body;

  if (!content || !content.trim()) {
    res.status(400).json({ success: false, message: "Comment content cannot be empty." });
    return;
  }

  const db = getDb();
  const blog = db.blogs.find((b) => b.id === id);
  if (!blog) {
    res.status(404).json({ success: false, message: "Blog post not found." });
    return;
  }

  const newComment: Comment = {
    id: "c_" + Date.now(),
    authorName: authorName?.trim() || "Guest Reader",
    authorEmail: authorEmail?.trim() || "guest@example.com",
    authorAvatar:
      authorAvatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorName || "guest")}`,
    content: content.trim(),
    createdAt: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
  };

  blog.comments.push(newComment);

  res.status(201).json({
    success: true,
    comment: newComment,
    message: "Comment posted successfully.",
  });
};

// GET /api/categories
export const getCategories = (_req: Request, res: Response): void => {
  res.json({
    success: true,
    categories: INITIAL_CATEGORIES,
  });
};
