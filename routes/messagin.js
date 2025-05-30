const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');
const { isVerifiedLawyer } = require('../middlewares/lawyerVerification');

// Import controllers
const MessagingController = require('../controllers/messagingController');

// Messaging routes
router.get('/', isAuthenticated, isVerifiedLawyer, MessagingController.getMessages);

// User search route
router.get('/search', isAuthenticated, isVerifiedLawyer, MessagingController.searchUsers);

// Conversation routes
router.get('/:conversationId', isAuthenticated, isVerifiedLawyer, MessagingController.getConversation);
router.post('/:conversationId/send', isAuthenticated, isVerifiedLawyer, MessagingController.sendMessage);

// AJAX routes for real-time messaging
router.get('/:conversationId/check-new', isAuthenticated, isVerifiedLawyer, MessagingController.checkNewMessages);
router.post('/:conversationId/send-ajax', isAuthenticated, isVerifiedLawyer, MessagingController.sendMessageAjax);

module.exports = router;