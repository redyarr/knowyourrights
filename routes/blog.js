const express = require('express');
const router = express.Router();
const blogController = require('../controllers/Blog');
const { isAuthenticated } = require('../middlewares/auth');

// Get all blogs
router.get('/', blogController.getAllBlogs);

// Get blog creation form
router.get('/create', isAuthenticated, blogController.getCreateForm);

// Create new blog
router.post('/create', isAuthenticated, blogController.createBlog);

// Get single blog
router.get('/:id', blogController.getSingleBlog);

// Get blog edit form
router.get('/:id/edit', isAuthenticated, blogController.getEditForm);

// Update blog
router.put('/:id', isAuthenticated, blogController.updateBlog);

// Delete blog
router.delete('/:id', isAuthenticated, blogController.deleteBlog);

// Populate categories (one-time operation)
router.post('/categories', blogController.populateCategories);

module.exports = router;
