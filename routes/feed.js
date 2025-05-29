const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');
const { isVerifiedLawyer } = require('../middlewares/lawyerVerification');
const multer = require('multer');

// Import controllers
const FeedController = require('../controllers/feedController');

const upload = multer({ dest: 'public/uploads/posts/' });

// Create post route
router.post('/create-post', isAuthenticated, isVerifiedLawyer, upload.single('image'), FeedController.createPost);

// Feed routes
router.get('/', isAuthenticated, isVerifiedLawyer, FeedController.getAllPosts);

// Post reaction and comment routes
router.post('/post/:id/react', isAuthenticated, FeedController.reactToPost);
router.post('/post/:id/comment', isAuthenticated, FeedController.commentOnPost);

// Edit and delete post routes
router.put('/post/:id/edit', isAuthenticated, isVerifiedLawyer, FeedController.editPost);
router.delete('/post/:id/delete', isAuthenticated, isVerifiedLawyer, FeedController.deletePost);

// Edit and delete comment routes
router.put('/comment/:id/edit', isAuthenticated, FeedController.editComment);
router.delete('/comment/:id/delete', isAuthenticated, FeedController.deleteComment);

module.exports = router;