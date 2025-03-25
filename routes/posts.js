const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { fileURLToPath } = require('url');
const Post = require('../models/post.js');
const Comment = require('../models/comment.js');
const Reaction = require('../models/react.js')
const { isAuthenticated } = require('../middlewares/auth');
const router = express.Router();


// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Middleware to check if user is authenticated


// Middleware to check if user is a lawyer
const isLawyer = (req, res, next) => {
  if (isAuthenticated() && req.user.role === 'lawyer') {
    return next();
  }
  req.flash('error', 'Only lawyers can access this page');
  res.redirect('/');
};

// Get all posts (feed)
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate('author')
      .populate({
        path: 'comments',
        populate: { path: 'author' }
      })
      .populate('reactions');
    
    res.render('posts/index', { 
      title: 'All Posts',
      posts
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load posts');
    res.redirect('/');
  }
});

// New post form (lawyers only)
router.get('/new', isLawyer, (req, res) => {
  res.render('posts/new', { title: 'Create New Post' });
});

// Create new post (lawyers only)
router.post('/', isLawyer, upload.single('image'), async (req, res) => {
  try {
    const { title, content } = req.body;
    const newPost = new Post({
      title,
      content,
      author: req.user._id,
      image: req.file ? `/uploads/${req.file.filename}` : null
    });
    
    await newPost.save();
    
    req.flash('success', 'Post created successfully');
    res.redirect(`/posts/${newPost._id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to create post');
    res.redirect('/posts/new');
  }
});

// Show single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author')
      .populate({
        path: 'comments',
        populate: { path: 'author' },
        options: { sort: { createdAt: -1 } }
      })
      .populate('reactions');
    
    if (!post) {
      req.flash('error', 'Post not found');
      return res.redirect('/');
    }
    
    // Check if user has reacted to this post
    let userReaction = null;
    if (req.isAuthenticated()) {
      userReaction = await Reaction.findOne({
        user: req.user._id,
        post: post._id
      });
    }
    
    res.render('posts/show', { 
      title: post.title,
      post,
      userReaction: userReaction ? userReaction.type : null
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load post');
    res.redirect('/');
  }
});

// Edit post form (lawyers only)
router.get('/:id/edit', isLawyer, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      req.flash('error', 'Post not found');
      return res.redirect('/');
    }
    
    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      req.flash('error', 'You can only edit your own posts');
      return res.redirect(`/posts/${post._id}`);
    }
    
    res.render('posts/edit', { 
      title: `Edit: ${post.title}`,
      post
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load post');
    res.redirect('/');
  }
});

// Update post (lawyers only)
router.put('/:id', isLawyer, upload.single('image'), async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      req.flash('error', 'Post not found');
      return res.redirect('/');
    }
    
    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      req.flash('error', 'You can only edit your own posts');
      return res.redirect(`/posts/${post._id}`);
    }
    
    // Update post
    post.title = title;
    post.content = content;
    post.updatedAt = Date.now();
    
    if (req.file) {
      // Delete old image if exists
      if (post.image) {
        const oldImagePath = path.join(__dirname, '../public', post.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      post.image = `/uploads/${req.file.filename}`;
    }
    
    await post.save();
    
    req.flash('success', 'Post updated successfully');
    res.redirect(`/posts/${post._id}`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update post');
    res.redirect(`/posts/${req.params.id}/edit`);
  }
});

// Delete post (lawyers only)
router.delete('/:id', isLawyer, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      req.flash('error', 'Post not found');
      return res.redirect('/');
    }
    
    // Check if user is the author
    if (post.author.toString() !== req.user._id.toString()) {
      req.flash('error', 'You can only delete your own posts');
      return res.redirect(`/posts/${post._id}`);
    }
    
    // Delete image if exists
    if (post.image) {
      const imagePath = path.join(__dirname, '../public', post.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    // Delete all comments and reactions associated with this post
    await Comment.deleteMany({ post: post._id });
    await Reaction.deleteMany({ post: post._id });
    
    // Delete post
    await Post.findByIdAndDelete(req.params.id);
    
    req.flash('success', 'Post deleted successfully');
    res.redirect('/');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to delete post');
    res.redirect(`/posts/${req.params.id}`);
  }
});

// Add reaction to post
router.post('/:id/react', isAuthenticated, async (req, res) => {
  try {
    const { type } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;
    
    // Check if reaction type is valid
    const validTypes = ['like', 'love', 'insightful', 'celebrate'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid reaction type' });
    }
    
    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Check if user already reacted to this post
    const existingReaction = await Reaction.findOne({
      user: userId,
      post: postId
    });
    
    if (existingReaction) {
      // If same reaction type, remove it (toggle off)
      if (existingReaction.type === type) {
        await Reaction.findByIdAndDelete(existingReaction._id);
        
        // Remove reaction from post
        post.reactions = post.reactions.filter(
          r => r.toString() !== existingReaction._id.toString()
        );
        await post.save();
        
        return res.json({ success: true, action: 'removed' });
      } else {
        // If different reaction type, update it
        existingReaction.type = type;
        await existingReaction.save();
        return res.json({ success: true, action: 'updated' });
      }
    } else {
      // Create new reaction
      const newReaction = new Reaction({
        type,
        user: userId,
        post: postId
      });
      
      await newReaction.save();
      
      // Add reaction to post
      post.reactions.push(newReaction._id);
      await post.save();
      
      return res.json({ success: true, action: 'added' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;