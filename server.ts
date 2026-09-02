import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import authRoutes from "./server/routes/authRoutes.js";
import blogRoutes from "./server/routes/blogRoutes.js";
import { connectDB, isMongoDBConnected } from "./server/config/db.js";
import { getDb } from "./server/db.js";
import { BlogModel } from "./server/models/Blog.js";
import { UserModel } from "./server/models/User.js";

const app = express();
const PORT = 3000;

// Connect to MongoDB
connectDB();

// Essential Middlewares
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Health Check Endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "Node.js & Express.js with MongoDB (Mongoose)",
    database: isMongoDBConnected() ? "MongoDB Connected" : "Memory-Backed Store",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// System Analytics / Stats Endpoint
app.get("/api/stats", async (_req: Request, res: Response) => {
  try {
    if (isMongoDBConnected()) {
      const totalPosts = await BlogModel.countDocuments();
      const publishedPosts = await BlogModel.countDocuments({ status: "published" });
      const totalUsers = await UserModel.countDocuments();
      const blogs = await BlogModel.find().lean();
      const totalViews = blogs.reduce((acc, b) => acc + (b.viewsCount || 0), 0);
      const totalLikes = blogs.reduce((acc, b) => acc + (b.likesCount || 0), 0);
      const totalComments = blogs.reduce((acc, b) => acc + (b.comments?.length || 0), 0);

      res.json({
        success: true,
        database: "MongoDB",
        stats: {
          totalPosts,
          publishedPosts,
          totalViews,
          totalLikes,
          totalComments,
          totalUsers,
        },
      });
      return;
    }

    const db = getDb();
    const totalPosts = db.blogs.length;
    const publishedPosts = db.blogs.filter((b) => b.status === "published").length;
    const totalViews = db.blogs.reduce((acc, b) => acc + (b.viewsCount || 0), 0);
    const totalLikes = db.blogs.reduce((acc, b) => acc + (b.likesCount || 0), 0);
    const totalComments = db.blogs.reduce((acc, b) => acc + (b.comments?.length || 0), 0);
    const totalUsers = db.users.length;

    res.json({
      success: true,
      database: "Memory-Backed Store",
      stats: {
        totalPosts,
        publishedPosts,
        totalViews,
        totalLikes,
        totalComments,
        totalUsers,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mount Modular REST API Routes
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);

// Vite middleware for development & static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Node.js & Express server running on http://0.0.0.0:${PORT}`);
    console.log(`📡 Health & DB Check: http://0.0.0.0:${PORT}/api/health`);
    console.log(`📝 Blogs API: http://0.0.0.0:${PORT}/api/blogs`);
  });
}

startServer().catch((err) => {
  console.error("Fatal: Server startup failed:", err);
});
