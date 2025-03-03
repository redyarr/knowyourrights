const express = require('express');
const router = express.Router();
const UserController = require('../controllers/User');
const NetworkController = require('../controllers/Network');
const MessageController = require('../controllers/Message');
const NotificationController = require('../controllers/Notification');

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user_id) {
    return next();
  }
  res.redirect('/user/login');
};

// User authentication routes
router.get('/create', UserController.getUserSignUp);
router.post('/create', UserController.postUserSignUp);
router.post('/create-lawyer', UserController.postCreateLawyer);
router.get('/complete-lawyer-profile', isAuthenticated, UserController.getCompleteLawyerProfile);
router.post('/complete-lawyer-profile', isAuthenticated, UserController.postCompleteLawyerProfile);

router.get('/login', UserController.getUserLogin);
router.post('/login', UserController.postUserLogin);
router.post('/logout', UserController.UserLogout);

// Network routes (placed before `/:id`)
router.get('/network', isAuthenticated, NetworkController.getNetwork);
router.post('/network/connect/:id', isAuthenticated, NetworkController.sendConnectionRequest);
router.post('/network/accept/:id', isAuthenticated, NetworkController.acceptConnectionRequest);
router.post('/network/reject/:id', isAuthenticated, NetworkController.rejectConnectionRequest);
router.post('/network/remove/:id', isAuthenticated, NetworkController.removeConnection);

// Messaging routes (placed before `/:id`)
router.get('/:id/messages', isAuthenticated, MessageController.getMessages);
router.get('/:id/messages/:conversationId', isAuthenticated, MessageController.getConversation);
router.post('/:id/messages/send', isAuthenticated, MessageController.sendMessage);

// Notification routes (placed before `/:id`)
router.get('/:id/notifications', isAuthenticated, NotificationController.getNotifications);
router.post('/:id/notifications/read/:notificationId', isAuthenticated, NotificationController.markAsRead);
router.post('/:id/notifications/read-all', isAuthenticated, NotificationController.markAllAsRead);

// User profile routes (moved to the bottom)
router.get('/edit/:id', isAuthenticated, UserController.getEditProfile);
router.post('/edit/:id', isAuthenticated, UserController.postEditProfile);
router.get('/:id', UserController.getUserProfile); // Moved to the last position

module.exports = router;
