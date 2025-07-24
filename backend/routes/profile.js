const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');
const { isVerifiedLawyer } = require('../middlewares/lawyerVerification');

// Import controllers
const ProfileController = require('../controllers/profileController');
const multer = require('multer');
const path = require('path');

// Multer configuration for ImageKit (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// view profile routes
router.get('/', isAuthenticated, ProfileController.findProfile);
router.get('/edit', isAuthenticated, ProfileController.getEditProfile);
router.post('/upload-profile-image', isAuthenticated, ProfileController.uploadProfileImage);

// Post-related routes (must come before /:id to avoid conflicts)
router.post('/:id/create-post', upload.single('image'), ProfileController.CreatePost);
router.post('/:id/edit-post', ProfileController.updatePost);
router.post('/:id/edit', isAuthenticated ,ProfileController.updateProfile);

// Profile viewing routes (must be last to avoid conflicts)
router.get('/:id', ProfileController.getProfile);
// post routes

module.exports = router;