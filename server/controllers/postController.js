const Post = require('../models/Post');
const Category = require('../models/Category');
const asyncHandler = require('express-async-handler');
const slugify = require('slugify');

// ============================================================
// @desc    Get all posts (with pagination and category filter)
// @route   GET /api/posts
// @access  Public
// ============================================================
exports.getAllPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const category = req.query.category;
  const sortBy = req.query.sort || 'createdAt';

  const query = {};
  if (category) query.category = category;

  const [posts, total] = await Promise.all([
    Post.find(query)
      .populate('author', 'name email avatar')
      .populate('category', 'name slug')
      .sort({ [sortBy]: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: posts.length,
    total,
    page,
    pages: Math.ceil(total / limit),
    data: posts,
  });
});

// ============================================================
// @desc    Get single post (by ID or slug)
// @route   GET /api/posts/:id
// @access  Public
// ============================================================
exports.getPost = asyncHandler(async (req, res) => {
  const post = await Post.findOne({
    $or: [{ _id: req.params.id }, { slug: req.params.id }],
  })
    .populate('author', 'name email avatar')
    .populate('category', 'name slug')
    .populate('comments.user', 'name avatar');

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  await post.incrementViewCount?.();

  res.status(200).json({
    success: true,
    data: post,
  });
});

// ============================================================
// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
// ============================================================
exports.createPost = asyncHandler(async (req, res) => {
  req.body.author = req.user?.id || null;

  // Handle uploaded image
  if (req.file) {
    req.body.featuredImage = req.file.filename;
  }

  // ✅ FIX: Handle category (accept name, slug, or ObjectId)
  if (req.body.category && typeof req.body.category === 'string') {
    let categoryDoc = null;

    // Check if category is an ObjectId (24 hex characters)
    if (/^[0-9a-fA-F]{24}$/.test(req.body.category)) {
      categoryDoc = await Category.findById(req.body.category);
    } else {
      categoryDoc = await Category.findOne({
        $or: [{ name: req.body.category }, { slug: req.body.category }],
      });
    }

    if (!categoryDoc) {
      console.error(`Category '${req.body.category}' not found`);
      return res.status(400).json({
        success: false,
        error: `Category '${req.body.category}' not found`,
      });
    }

    req.body.category = categoryDoc._id; // Replace name/slug with ObjectId
  }

  // Generate slug if not provided
  if (!req.body.slug && req.body.title) {
    req.body.slug = slugify(req.body.title, { lower: true, strict: true });
  }

  const post = await Post.create(req.body);

  res.status(201).json({
    success: true,
    data: post,
  });
});

// ============================================================
// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
// ============================================================
exports.updatePost = asyncHandler(async (req, res) => {
  let post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  // Check authorization
  if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to update this post');
  }

  if (req.file) {
    req.body.featuredImage = req.file.filename;
  }

  // Update slug if title changes
  if (req.body.title) {
    req.body.slug = slugify(req.body.title, { lower: true, strict: true });
  }

  // ✅ FIX: Handle category during update
  if (req.body.category && typeof req.body.category === 'string') {
    let categoryDoc = null;

    if (/^[0-9a-fA-F]{24}$/.test(req.body.category)) {
      categoryDoc = await Category.findById(req.body.category);
    } else {
      categoryDoc = await Category.findOne({
        $or: [{ name: req.body.category }, { slug: req.body.category }],
      });
    }

    if (categoryDoc) {
      req.body.category = categoryDoc._id;
    }
  }

  post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: post,
  });
});

// ============================================================
// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
// ============================================================
exports.deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this post');
  }

  await post.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Post deleted successfully',
  });
});

// ============================================================
// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
// ============================================================
exports.addComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const comment = {
    user: req.user.id,
    content: req.body.content,
  };

  post.comments.push(comment);
  await post.save();

  res.status(201).json({
    success: true,
    data: post,
  });
});

// ============================================================
// @desc    Search posts
// @route   GET /api/posts/search
// @access  Public
// ============================================================
exports.searchPosts = asyncHandler(async (req, res) => {
  const query = req.query.q;

  if (!query) {
    res.status(400);
    throw new Error('Please provide a search query');
  }

  const posts = await Post.find({
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } },
    ],
  })
    .populate('author', 'name email')
    .populate('category', 'name slug')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: posts.length,
    data: posts,
  });
});
