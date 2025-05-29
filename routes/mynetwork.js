const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');

// Import controllers
const MyNetworkController = require('../controllers/mynetworkController');

// Network routes
router.get('/', isAuthenticated, MyNetworkController.getNetwork);

// Connection request routes
router.post('/connect/:userId', isAuthenticated, MyNetworkController.sendConnectionRequest);
router.post('/accept/:connectionId', isAuthenticated, MyNetworkController.acceptConnectionRequest);
router.post('/decline/:connectionId', isAuthenticated, MyNetworkController.declineConnectionRequest);
router.post('/cancel/:connectionId', isAuthenticated, MyNetworkController.cancelConnectionRequest);
router.get('/connection-status/:userId', isAuthenticated, MyNetworkController.getConnectionStatus);

// API routes for suggested connections
router.get('/suggested-lawyers', isAuthenticated, MyNetworkController.getSuggestedLawyers);

module.exports = router;