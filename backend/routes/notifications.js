const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');

// Import controllers
const NotificationController = require('../controllers/notificationController');

// Authentication routes
router.get('/', isAuthenticated ,NotificationController.getNotifications);
router.post('/mark-read', isAuthenticated ,NotificationController.markAsRead);

module.exports = router;