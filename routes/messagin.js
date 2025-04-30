const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');

// Import controllers
const MessagingController = require('../controllers/messagingController');

// Messaging routes
router.get('/', isAuthenticated, MessagingController.getMessages);

// User search route
router.get('/search', isAuthenticated, MessagingController.searchUsers);

// Conversation routes
router.get('/:conversationId', isAuthenticated, MessagingController.getConversation);
router.post('/:conversationId/send', isAuthenticated, MessagingController.sendMessage);

module.exports = router;