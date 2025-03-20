const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');

// Import controllers
const FeedController = require('../controllers/feedController');

// Authentication routes
router.get('/', FeedController.getAllPosts);

module.exports = router;