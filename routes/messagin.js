const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');

// Import controllers
const MessagingController = require('../controllers/messagingController');

// Messaging routes
router.get('/', isAuthenticated, MessagingController.getMessages);

// Conversation routes
router.get('/user/:userId/messages/:conversationId', isAuthenticated, MessagingController.getConversation);
router.post('/user/:userId/messages/:conversationId/send', isAuthenticated, MessagingController.sendMessage);

module.exports = router;