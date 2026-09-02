import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { INITIAL_BLOGS, INITIAL_USERS } from "../../src/data/initialData.js";
import { UserModel } from "../models/User.js";
import { BlogModel } from "../models/Blog.js";

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoURI) {
    console.log("ℹ️ MONGO_URI not provided in .env. Operating in memory-backed mode with MongoDB schema validation.");
    return;
  }

  if (isConnected) {
    return;
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);

    // Seed database if collections are empty
    await seedInitialData();
  } catch (error: any) {
    console.error(`⚠️ MongoDB Connection Warning: ${error.message}`);
    console.log("ℹ️ Server continuing with fallback data store for uninterrupted resilience.");
  }
};

export const isMongoDBConnected = (): boolean => isConnected;

// Helper to seed initial high quality data into MongoDB on first run
async function seedInitialData() {
  try {
    const userCount = await UserModel.countDocuments();
    if (userCount === 0) {
      console.log("🌱 Seeding initial users into MongoDB...");
      for (const u of INITIAL_USERS) {
        const hashedPassword = u.password?.startsWith("$2a$")
          ? u.password
          : await bcrypt.hash(u.password || "password123", 10);

        await UserModel.create({
          id: u.id,
          name: u.name,
          email: u.email.toLowerCase(),
          username: u.username.toLowerCase(),
          password: hashedPassword,
          avatar: u.avatar,
          bio: u.bio,
          joinedDate: u.joinedDate,
        });
      }
      console.log("✅ Seeded initial users.");
    }

    const blogCount = await BlogModel.countDocuments();
    if (blogCount === 0) {
      console.log("🌱 Seeding initial blog articles into MongoDB...");
      for (const b of INITIAL_BLOGS) {
        await BlogModel.create({
          id: b.id,
          title: b.title,
          slug: b.slug,
          description: b.description,
          content: b.content,
          authorId: b.authorId,
          authorName: b.authorName,
          authorAvatar: b.authorAvatar,
          category: b.category,
          tags: b.tags,
          coverImage: b.coverImage,
          createdAt: b.createdAt,
          updatedAt: b.updatedAt,
          status: b.status,
          likesCount: b.likesCount,
          viewsCount: b.viewsCount,
          readTimeMinutes: b.readTimeMinutes,
          comments: b.comments || [],
        });
      }
      console.log("✅ Seeded initial blog articles.");
    }
  } catch (seedErr: any) {
    console.warn("Notice: Data seed check completed:", seedErr.message);
  }
}
