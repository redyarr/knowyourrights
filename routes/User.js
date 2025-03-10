const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const ProfileController = require('../controllers/profileController')
const NotificationController = require('../controllers/notificationController');
const { isAuthenticated } = require('../middlewares/auth');

// Authentication routes
router.get('/register', AuthController.getRegister);
router.post('/register', AuthController.register);
router.get('/login', AuthController.getLogin);
router.post('/login', AuthController.login);
router.get('/logout', isAuthenticated, AuthController.logout);

// user profile
// router.get('/profile', isAuthenticated, ProfileController.getProfile);
router.get('/profile/:id', isAuthenticated, ProfileController.getProfile);
router.get('/profile/:id/update', isAuthenticated, ProfileController.updateProfile);
// Network routes
router.get('/notification', isAuthenticated, NotificationController.getNotifications);
// router.get('/notification', isAuthenticated, NotificationController.getNotifications);
// router.post('/network/connect/:id', isAuthenticated, AuthController.sendConnectionRequest);
// router.post('/network/accept/:id', isAuthenticated, AuthController.acceptConnection);
// router.post('/network/reject/:id', isAuthenticated, AuthController.rejectConnection);

module.exports = router;