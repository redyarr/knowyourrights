const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');

// Import controllers
const FeedController = require('../controllers/feedController');

// Create post route
router.post('/create-post', isAuthenticated, upload.single('image'), FeedController.createPost);

// Feed routes
router.get('/', FeedController.getAllPosts);

// Post reaction and comment routes
router.post('/post/:id/react', isAuthenticated, FeedController.reactToPost);
router.post('/post/:id/comment', isAuthenticated, FeedController.commentOnPost);

// Edit and delete post routes
router.put('/post/:id/edit', isAuthenticated, FeedController.editPost);
router.delete('/post/:id/delete', isAuthenticated, FeedController.deletePost);

// Edit and delete comment routes
router.put('/comment/:id/edit', isAuthenticated, FeedController.editComment);
router.delete('/comment/:id/delete', isAuthenticated, FeedController.deleteComment);

module.exports = router;