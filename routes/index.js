const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');

// Import controllers
const MessageController = require('../controllers/messageController');
const NotificationController = require('../controllers/notificationController');
const ProfileController = require('../controllers/profileController');

// Message routes
router.get('/messages', isAuthenticated, MessageController.getMessages);
router.post('/messages/send', isAuthenticated, MessageController.sendMessage);
router.get('/messages/:id', isAuthenticated, MessageController.getConversation);

// Notification routes
router.get('/notifications', isAuthenticated, NotificationController.getNotifications);
router.post('/notifications/mark-read', isAuthenticated, NotificationController.markAsRead);

// Profile routes
router.get('/profile', isAuthenticated, ProfileController.getProfile);
router.get('/profile/:id', isAuthenticated, ProfileController.getUserProfile);
router.put('/profile', isAuthenticated, ProfileController.updateProfile);

module.exports = router;