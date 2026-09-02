const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    authorName: {
      type: String,
      required: [true, 'Commenter name is required'],
      trim: true,
      default: 'Guest Reader',
    },
    authorEmail: {
      type: String,
      trim: true,
      default: 'guest@example.com',
    },
    authorAvatar: {
      type: String,
      default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest',
    },
    content: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters long'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    content: {
      type: String,
      required: [true, 'Blog content is required'],
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    authorName: {
      type: String,
      required: [true, 'Author name is required'],
      default: 'Divya Goudar',
    },
    authorAvatar: {
      type: String,
      default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=author',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      default: 'Technology',
      enum: [
        'Technology',
        'Web Development',
        'AI & ML',
        'Cloud & DevOps',
        'Design & UI/UX',
        'Cybersecurity',
        'Career & Productivity',
      ],
    },
    tags: {
      type: [String],
      default: ['Technology', 'Coding'],
    },
    coverImage: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    },
    status: {
      type: String,
      enum: ['published', 'draft'],
      default: 'published',
    },
    likesCount: {
      type: Number,
      default: 0,
      min: [0, 'Likes count cannot be negative'],
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: [0, 'Views count cannot be negative'],
    },
    readTimeMinutes: {
      type: Number,
      default: 1,
      min: [1, 'Read time must be at least 1 minute'],
    },
    comments: {
      type: [commentSchema],
      default: [],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Auto-generate slug and calculate read time before saving
blogSchema.pre('save', function () {
  if (this.isModified('title') && (!this.slug || this.slug === '')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  if (this.isModified('content') && this.content) {
    const wordCount = this.content.trim().split(/\s+/).length;
    this.readTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));
  }

  if (this.isModified('content') || this.isModified('title')) {
    this.updatedAt = new Date();
  }
});

module.exports = mongoose.models.Blog || mongoose.model('Blog', blogSchema);
