const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');
const { isVerifiedLawyer } = require('../middlewares/lawyerVerification');
const multer = require('multer');

// Import controllers
const FeedController = require('../controllers/feedController');

// Configure multer for memory storage (ImageKit will handle file storage)
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Create post route
router.post('/create-post', isAuthenticated, isVerifiedLawyer, upload.single('image'), FeedController.createPost);

// Feed routes
router.get('/', isAuthenticated, isVerifiedLawyer, FeedController.getFeedPosts);

// Post reaction and comment routes
router.post('/post/:id/react', isAuthenticated, FeedController.reactToPost);
router.post('/post/:id/comment', isAuthenticated, FeedController.commentOnPost);

// Edit and delete post routes
router.put('/post/:id/edit', isAuthenticated, isVerifiedLawyer, FeedController.editPost);
router.delete('/post/:id/delete', isAuthenticated, isVerifiedLawyer, FeedController.deletePost);

// Edit and delete comment routes
router.put('/comment/:id/edit', isAuthenticated, FeedController.editComment);
router.delete('/comment/:id/delete', isAuthenticated, FeedController.deleteComment);

// Share routes
router.post('/post/:id/share', isAuthenticated, FeedController.sharePost);
router.get('/users/:userId/shared-posts', isAuthenticated, FeedController.getSharedPosts);
router.get('/shared-posts', isAuthenticated, FeedController.getSharedPosts);

module.exports = router;