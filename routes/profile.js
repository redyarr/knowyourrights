const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');

// Import controllers
const ProfileController = require('../controllers/profileController');

// view profile routes
router.get('/', ProfileController.findProfile);
router.post('/:id/create-post', ProfileController.CreatePost);
router.post('/:id/edit-post', ProfileController.updatePost);

router.post('/:id/edit', ProfileController.updateProfile)
router.get('/:id', ProfileController.getProfile);
// post routes

module.exports = router;