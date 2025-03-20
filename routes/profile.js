const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');

// Import controllers
const ProfileController = require('../controllers/profileController');

// view profile routes
router.get('/', ProfileController.findProfile);
router.get('/:id', ProfileController.getProfile);
router.post('/:id/edit', ProfileController.updateProfile)

// post routes
router.post('/:id/create-post', ProfileController.CreatePost);
router.post('/:id/edit-post', ProfileController.updatePost);

module.exports = router;