import { Request, Response } from "express";
import { getDb } from "../db.js";
import { AuthRequest } from "../middleware/auth.js";
import { BlogPost, Comment } from "../../src/types.js";
import { INITIAL_CATEGORIES } from "../../src/data/initialData.js";
import { BlogModel } from "../models/Blog.js";
import { isMongoDBConnected } from "../config/db.js";

// GET /api/blogs
export const getBlogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, authorId, status, sort } = req.query;

    if (isMongoDBConnected()) {
      const filterQuery: any = {};

      if (status) {
        filterQuery.status = status;
      } else if (!authorId) {
        filterQuery.status = "published";
      }

      if (authorId) {
        filterQuery.authorId = authorId;
      }

      if (category && category !== "all") {
        filterQuery.category = { $regex: new RegExp(`^${category}$`, "i") };
      }

      if (search) {
        const q = search as string;
        filterQuery.$or = [
          { title: { $regex: q, $options: "i" } },
          { description: { $regex: q, $options: "i" } },
          { content: { $regex: q, $options: "i" } },
          { authorName: { $regex: q, $options: "i" } },
          { tags: { $in: [new RegExp(q, "i")] } },
        ];
      }

      let sortOption: any = { createdAt: -1 };
      if (sort === "popular" || sort === "views") {
        sortOption = { viewsCount: -1 };
      } else if (sort === "likes") {
        sortOption = { likesCount: -1 };
      }

      const mongoBlogs = await BlogModel.find(filterQuery)
        .sort(sortOption)
        .lean();

      res.json({
        success: true,
        source: "MongoDB",
        count: mongoBlogs.length,
        blogs: mongoBlogs,
      });
      return;
    }

    // Fallback store
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
      source: "MemoryStore",
      count: results.length,
      blogs: results,
    });
  } catch (error: any) {
    console.error("Get Blogs Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve blogs from database.",
      blogs: [],
    });
  }
};

// GET /api/blogs/:id
export const getBlogById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (isMongoDBConnected()) {
      // Find by id or _id
      const query = id.match(/^[0-9a-fA-F]{24}$/)
        ? { $or: [{ id }, { _id: id }] }
        : { id };

      const blog = await BlogModel.findOne(query);
      if (blog) {
        blog.viewsCount += 1;
        await blog.save();
        res.json({ success: true, blog });
        return;
      }
    }

    // Fallback store
    const db = getDb();
    const blog = db.blogs.find((b) => b.id === id);

    if (!blog) {
      res.status(404).json({
        success: false,
        message: `Blog post with ID "${id}" does not exist or has been removed.`,
      });
      return;
    }

    blog.viewsCount += 1;
    res.json({ success: true, blog });
  } catch (error: any) {
    console.error("Get Blog By ID Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve blog details from database.",
    });
  }
};

// POST /api/blogs (Protected)
export const createBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, content, category, tags, coverImage, status } = req.body;

    // Validate inputs
    if (!title || !title.trim()) {
      res.status(400).json({ success: false, message: "Blog title is required." });
      return;
    }
    if (!content || !content.trim()) {
      res.status(400).json({ success: false, message: "Blog content cannot be empty." });
      return;
    }

    const now = new Date();
    const formattedDate = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const words = content.trim().split(/\s+/).length;
    const readTimeMinutes = Math.max(1, Math.ceil(words / 180));

    const blogId = "blog_" + Date.now();
    const authorId = req.user ? req.user.id : "user_anonymous";
    const authorName = req.user ? req.user.name : "Divya Goudar";
    const authorAvatar = req.user
      ? req.user.avatar
      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorName)}`;

    const newBlog: BlogPost = {
      id: blogId,
      title: title.trim(),
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
      description:
        description?.trim() ||
        content.replace(/[#*`_\[\]]/g, "").slice(0, 140) + "...",
      content: content.trim(),
      authorId,
      authorName,
      authorAvatar,
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

    // Store in MongoDB
    if (isMongoDBConnected()) {
      await BlogModel.create({
        ...newBlog,
      });
    }

    // Keep memory db synchronized
    const db = getDb();
    db.blogs.unshift(newBlog);

    res.status(201).json({
      success: true,
      message:
        newBlog.status === "published"
          ? "Blog post published and saved to database successfully!"
          : "Blog saved as draft in database.",
      blog: newBlog,
    });
  } catch (error: any) {
    console.error("Create Blog Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create blog post in database.",
    });
  }
};

// PUT /api/blogs/:id (Protected)
export const updateBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, content, category, tags, coverImage, status } = req.body;

    const formattedDate = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    let updatedBlog: BlogPost | null = null;

    if (isMongoDBConnected()) {
      const query = id.match(/^[0-9a-fA-F]{24}$/)
        ? { $or: [{ id }, { _id: id }] }
        : { id };

      const existing = await BlogModel.findOne(query);
      if (existing) {
        if (req.user && existing.authorId !== req.user.id) {
          res.status(403).json({ success: false, message: "You are not authorized to edit this post." });
          return;
        }

        const updatedContent = content !== undefined ? content : existing.content;
        const words = updatedContent.trim().split(/\s+/).length;
        const readTimeMinutes = Math.max(1, Math.ceil(words / 180));

        if (title !== undefined) existing.title = title.trim();
        if (description !== undefined) existing.description = description.trim();
        if (content !== undefined) existing.content = content.trim();
        if (category) existing.category = category;
        if (tags) existing.tags = tags;
        if (coverImage) existing.coverImage = coverImage;
        if (status) existing.status = status;
        existing.updatedAt = formattedDate;
        existing.readTimeMinutes = readTimeMinutes;

        await existing.save();
        updatedBlog = existing.toObject();
      }
    }

    const db = getDb();
    const blogIndex = db.blogs.findIndex((b) => b.id === id);
    if (blogIndex !== -1) {
      const memExisting = db.blogs[blogIndex];
      const updatedContent = content !== undefined ? content : memExisting.content;
      const words = updatedContent.trim().split(/\s+/).length;
      const readTimeMinutes = Math.max(1, Math.ceil(words / 180));

      db.blogs[blogIndex] = {
        ...memExisting,
        title: title !== undefined ? title.trim() : memExisting.title,
        description: description !== undefined ? description.trim() : memExisting.description,
        content: updatedContent,
        category: category || memExisting.category,
        tags: Array.isArray(tags) ? tags : memExisting.tags,
        coverImage: coverImage || memExisting.coverImage,
        status: status || memExisting.status,
        updatedAt: formattedDate,
        readTimeMinutes,
      };
      if (!updatedBlog) updatedBlog = db.blogs[blogIndex];
    }

    if (!updatedBlog) {
      res.status(404).json({ success: false, message: "Blog post not found in database." });
      return;
    }

    res.json({
      success: true,
      message: "Blog updated in database successfully.",
      blog: updatedBlog,
    });
  } catch (error: any) {
    console.error("Update Blog Error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to update blog post." });
  }
};

// DELETE /api/blogs/:id (Protected)
export const deleteBlog = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let deleted = false;

    if (isMongoDBConnected()) {
      const query = id.match(/^[0-9a-fA-F]{24}$/)
        ? { $or: [{ id }, { _id: id }] }
        : { id };

      const existing = await BlogModel.findOne(query);
      if (existing) {
        if (req.user && existing.authorId !== req.user.id) {
          res.status(403).json({ success: false, message: "You are not authorized to delete this post." });
          return;
        }
        await BlogModel.deleteOne(query);
        deleted = true;
      }
    }

    const db = getDb();
    const blogIndex = db.blogs.findIndex((b) => b.id === id);
    if (blogIndex !== -1) {
      db.blogs.splice(blogIndex, 1);
      deleted = true;
    }

    if (!deleted) {
      res.status(404).json({ success: false, message: "Blog post not found in database." });
      return;
    }

    res.json({ success: true, message: "Blog post deleted from database successfully." });
  } catch (error: any) {
    console.error("Delete Blog Error:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to delete blog." });
  }
};

// POST /api/blogs/:id/like
export const likeBlog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let likesCount = 0;

    if (isMongoDBConnected()) {
      const query = id.match(/^[0-9a-fA-F]{24}$/)
        ? { $or: [{ id }, { _id: id }] }
        : { id };

      const blog = await BlogModel.findOne(query);
      if (blog) {
        blog.likesCount += 1;
        await blog.save();
        likesCount = blog.likesCount;
      }
    }

    const db = getDb();
    const memBlog = db.blogs.find((b) => b.id === id);
    if (memBlog) {
      memBlog.likesCount += 1;
      if (!likesCount) likesCount = memBlog.likesCount;
    }

    res.json({
      success: true,
      likesCount,
      message: "Post liked.",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/blogs/:id/comments
export const addComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { content, authorName, authorEmail, authorAvatar } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ success: false, message: "Comment content cannot be empty." });
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

    if (isMongoDBConnected()) {
      const query = id.match(/^[0-9a-fA-F]{24}$/)
        ? { $or: [{ id }, { _id: id }] }
        : { id };

      const blog = await BlogModel.findOne(query);
      if (blog) {
        blog.comments.push(newComment);
        await blog.save();
      }
    }

    const db = getDb();
    const memBlog = db.blogs.find((b) => b.id === id);
    if (memBlog) {
      memBlog.comments.push(newComment);
    }

    res.status(201).json({
      success: true,
      comment: newComment,
      message: "Comment saved to database successfully.",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/categories
export const getCategories = (_req: Request, res: Response): void => {
  res.json({
    success: true,
    categories: INITIAL_CATEGORIES,
  });
};
