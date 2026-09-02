const Blog = require('../models/Blog');

// @desc    Get all blogs with filtering, searching, and sorting
// @route   GET /api/blogs
// @access  Public
const getAllBlogs = async (req, res) => {
  try {
    const { category, search, author, status, sort } = req.query;

    const query = {};

    // Filter by status (default to published for public feeds)
    if (status) {
      query.status = status;
    } else {
      query.status = 'published';
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by author
    if (author) {
      query.authorName = new RegExp(author, 'i');
    }

    // Multi-field search
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { content: searchRegex },
        { tags: searchRegex },
        { authorName: searchRegex },
      ];
    }

    // Sorting options
    let sortOptions = { createdAt: -1 }; // latest default
    if (sort === 'popular') {
      sortOptions = { likesCount: -1, viewsCount: -1 };
    } else if (sort === 'views') {
      sortOptions = { viewsCount: -1 };
    } else if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    }

    const blogs = await Blog.find(query).sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: blogs.length,
      blogs: blogs.map((b) => ({
        id: b._id,
        title: b.title,
        slug: b.slug,
        description: b.description,
        content: b.content,
        author: b.author,
        authorName: b.authorName,
        authorAvatar: b.authorAvatar,
        category: b.category,
        tags: b.tags,
        coverImage: b.coverImage,
        status: b.status,
        likesCount: b.likesCount,
        viewsCount: b.viewsCount,
        readTimeMinutes: b.readTimeMinutes,
        commentsCount: b.comments ? b.comments.length : 0,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      })),
    });
  } catch (error) {
    console.error('Get All Blogs Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve blogs from MongoDB',
    });
  }
};

// @desc    Get single blog by ID with auto-incrementing view counter
// @route   GET /api/blogs/:id
// @access  Public
const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: `Blog post with ID '${id}' was not found`,
      });
    }

    // Increment views
    blog.viewsCount = (blog.viewsCount || 0) + 1;
    await blog.save();

    return res.status(200).json({
      success: true,
      blog: {
        id: blog._id,
        title: blog.title,
        slug: blog.slug,
        description: blog.description,
        content: blog.content,
        author: blog.author,
        authorName: blog.authorName,
        authorAvatar: blog.authorAvatar,
        category: blog.category,
        tags: blog.tags,
        coverImage: blog.coverImage,
        status: blog.status,
        likesCount: blog.likesCount,
        viewsCount: blog.viewsCount,
        readTimeMinutes: blog.readTimeMinutes,
        comments: blog.comments,
        createdAt: blog.createdAt,
        updatedAt: blog.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get Blog By ID Error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid Blog ID format',
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve blog details from database',
    });
  }
};

// @desc    Create a new blog post
// @route   POST /api/blogs
// @access  Private
const createBlog = async (req, res) => {
  try {
    const {
      title,
      description,
      content,
      category,
      tags,
      coverImage,
      status,
      authorName,
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        error: 'Both title and content are required to publish a blog',
      });
    }

    const blog = await Blog.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      content: content.trim(),
      category: category || 'Technology',
      tags: Array.isArray(tags) ? tags : ['Technology'],
      coverImage:
        coverImage ||
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
      status: status || 'published',
      author: req.user ? req.user._id : undefined,
      authorName: req.user ? req.user.name : authorName || 'Divya Goudar',
      authorAvatar: req.user
        ? req.user.avatar
        : 'https://api.dicebear.com/7.x/avataaars/svg?seed=author',
    });

    return res.status(201).json({
      success: true,
      message: 'Blog post created and stored in MongoDB successfully',
      blog: {
        id: blog._id,
        title: blog.title,
        slug: blog.slug,
        description: blog.description,
        content: blog.content,
        author: blog.author,
        authorName: blog.authorName,
        authorAvatar: blog.authorAvatar,
        category: blog.category,
        tags: blog.tags,
        coverImage: blog.coverImage,
        status: blog.status,
        likesCount: blog.likesCount,
        viewsCount: blog.viewsCount,
        readTimeMinutes: blog.readTimeMinutes,
        createdAt: blog.createdAt,
      },
    });
  } catch (error) {
    console.error('Create Blog Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create blog post in MongoDB',
    });
  }
};

// @desc    Update an existing blog post
// @route   PUT /api/blogs/:id
// @access  Private
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: `Blog post with ID '${id}' not found`,
      });
    }

    const {
      title,
      description,
      content,
      category,
      tags,
      coverImage,
      status,
    } = req.body;

    if (title) blog.title = title.trim();
    if (description !== undefined) blog.description = description.trim();
    if (content) blog.content = content.trim();
    if (category) blog.category = category;
    if (tags) blog.tags = tags;
    if (coverImage) blog.coverImage = coverImage;
    if (status) blog.status = status;
    blog.updatedAt = new Date();

    await blog.save();

    return res.status(200).json({
      success: true,
      message: 'Blog post updated successfully in MongoDB',
      blog,
    });
  } catch (error) {
    console.error('Update Blog Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update blog post',
    });
  }
};

// @desc    Delete a blog post
// @route   DELETE /api/blogs/:id
// @access  Private
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: `Blog post with ID '${id}' not found`,
      });
    }

    await Blog.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Blog post removed permanently from MongoDB',
    });
  } catch (error) {
    console.error('Delete Blog Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete blog post from database',
    });
  }
};

module.exports = {
  getAllBlogs,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
};
