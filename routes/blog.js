const router = require('express').Router();

const BlogController = require('../controllers/blogs');

router.get('/', BlogController.getBlogs)

router.get('/BlogForm',BlogController.GetPostForm);

router.get('/Cat', BlogController.PutCategories);


module.exports= router;
