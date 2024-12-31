const express = require('express');
const router = express.Router();
const BlogController = require('../controllers/blogs');

// Middleware to parse URL-encoded bodies (for form submissions)
router.use(express.urlencoded({ extended: true }));

router.get('/', BlogController.getBlogs)

router.get('/BlogForm',BlogController.GetPostForm);

router.get('/Cat', BlogController.PutCategories);


module.exports= router;
