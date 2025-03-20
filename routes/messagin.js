const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');

// Import controllers
const MessagingController = require('../controllers/messagingController');

// Authentication routes
router.get('/', isAuthenticated, MessagingController.getMessages);

module.exports = router;