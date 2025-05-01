const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');

// Import controllers
const FeedController = require('../controllers/feedController');

// Feed routes
router.get('/', FeedController.getAllPosts);

// Post reaction and comment routes
router.post('/post/:id/react', isAuthenticated, FeedController.reactToPost);
router.post('/post/:id/comment', isAuthenticated, FeedController.commentOnPost);

module.exports = router;