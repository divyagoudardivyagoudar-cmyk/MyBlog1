import mongoose, { Document, Schema, Model } from "mongoose";
import { BlogPost, Comment } from "../../src/types.js";

const commentSchema = new Schema<Comment>(
  {
    id: {
      type: String,
      default: () => "c_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4),
    },
    authorName: {
      type: String,
      required: true,
      default: "Guest Reader",
    },
    authorEmail: {
      type: String,
      default: "guest@example.com",
    },
    authorAvatar: {
      type: String,
      default: "https://api.dicebear.com/7.x/avataaars/svg?seed=guest",
    },
    content: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
    },
    createdAt: {
      type: String,
      default: () =>
        new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
  },
  { _id: false }
);

export interface BlogDocument extends Document {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  category: string;
  tags: string[];
  coverImage: string;
  createdAt: string;
  updatedAt: string;
  status: "published" | "draft";
  likesCount: number;
  viewsCount: number;
  readTimeMinutes: number;
  comments: Comment[];
}

const blogSchema = new Schema<BlogDocument>(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => "blog_" + Date.now(),
    },
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      default: function (this: any) {
        return (this.title || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      },
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    content: {
      type: String,
      required: [true, "Blog content is required"],
    },
    authorId: {
      type: String,
      required: [true, "Author ID is required"],
    },
    authorName: {
      type: String,
      required: [true, "Author Name is required"],
    },
    authorAvatar: {
      type: String,
      default: "https://api.dicebear.com/7.x/avataaars/svg?seed=author",
    },
    category: {
      type: String,
      default: "Technology",
    },
    tags: {
      type: [String],
      default: ["Technology", "Coding"],
    },
    coverImage: {
      type: String,
      default: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
    },
    createdAt: {
      type: String,
      default: () =>
        new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
    updatedAt: {
      type: String,
      default: () =>
        new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
    },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    readTimeMinutes: {
      type: Number,
      default: 1,
    },
    comments: {
      type: [commentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const BlogModel: Model<BlogDocument> =
  mongoose.models.Blog || mongoose.model<BlogDocument>("Blog", blogSchema);
