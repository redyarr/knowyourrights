const express = require('express');
const router = express.Router();
const PostController = require('../controllers/postController');
const { isAuthenticated } = require('../middlewares/auth');

router.get('/', isAuthenticated, PostController.getAllPosts);

module.exports = router;