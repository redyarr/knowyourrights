const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');

// Import controllers
const AuthController = require('../controllers/authController');

// Authentication routes
router.get('/', AuthController.get); // completed
router.get('/register', AuthController.getRegister); 
router.post('/register', AuthController.register); 
router.get('/login', AuthController.getLogin);
router.post('/login', AuthController.login);
router.get('/logout', isAuthenticated, AuthController.signout); // completed
router.post('/signout', isAuthenticated, AuthController.signout); // completed

module.exports = router;