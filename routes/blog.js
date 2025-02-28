const express = require('express');
const router = express.Router();
const BlogController = require('../controllers/Blog');

// Middleware to parse URL-encoded bodies (for form submissions)
router.use(express.urlencoded({ extended: true }));

router.get('/', BlogController.getBlogs)

router.get('/form',BlogController.BlogForm);

router.get('/:id', BlogController.Blog)

router.get('/Cat', BlogController.PutCategories);


module.exports= router;
