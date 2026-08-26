import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { createServer as createViteServer } from "vite";
import authRoutes from "./server/routes/authRoutes.js";
import blogRoutes from "./server/routes/blogRoutes.js";
import { getDb } from "./server/db.js";

const app = express();
const PORT = 3000;

// Essential Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "Node.js & Express.js REST API Server",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// System Analytics / Stats Endpoint
app.get("/api/stats", (_req: Request, res: Response) => {
  const db = getDb();
  const totalPosts = db.blogs.length;
  const publishedPosts = db.blogs.filter((b) => b.status === "published").length;
  const totalViews = db.blogs.reduce((acc, b) => acc + (b.viewsCount || 0), 0);
  const totalLikes = db.blogs.reduce((acc, b) => acc + (b.likesCount || 0), 0);
  const totalComments = db.blogs.reduce((acc, b) => acc + (b.comments?.length || 0), 0);
  const totalUsers = db.users.length;

  res.json({
    success: true,
    stats: {
      totalPosts,
      publishedPosts,
      totalViews,
      totalLikes,
      totalComments,
      totalUsers,
    },
  });
});

// Mount Modular REST API Routes
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);

// Vite middleware for dev / static serving for production
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
    console.log(`🚀 Node.js & Express server listening on http://0.0.0.0:${PORT}`);
    console.log(`📡 API Health: http://0.0.0.0:${PORT}/api/health`);
  });
}

startServer().catch((err) => {
  console.error("Fatal: Server start failed:", err);
});
