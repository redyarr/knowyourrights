const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');
const { isVerifiedLawyer } = require('../middlewares/lawyerVerification');

// Import controllers
const ProfileController = require('../controllers/profileController');
const multer = require('multer');
const path = require('path');

// Multer storage configuration (should match controller)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads/posts'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// view profile routes
router.get('/', isAuthenticated, isVerifiedLawyer, ProfileController.findProfile);
router.get('/:userId', isAuthenticated, isVerifiedLawyer, ProfileController.findProfile);
router.get('/edit', isAuthenticated, ProfileController.getEditProfile);
router.post('/upload-profile-image', isAuthenticated, ProfileController.uploadProfileImage);
router.post('/:id/create-post', upload.single('image'), ProfileController.CreatePost);
router.post('/:id/edit-post', ProfileController.updatePost);
router.post('/:id/edit', ProfileController.updateProfile);
router.get('/:id', ProfileController.getProfile);
// post routes

module.exports = router;