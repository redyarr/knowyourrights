const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');

// Import controllers
const MyNetworkController = require('../controllers/mynetworkController');

// Authentication routes
router.get('/', isAuthenticated, MyNetworkController.getNetwork);

module.exports = router;