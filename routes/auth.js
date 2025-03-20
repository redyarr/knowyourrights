const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');

// Import controllers
const AuthController = require('../controllers/authController');

// Authentication routes
router.get('/', AuthController.get);
router.get('/register', AuthController.getRegister);
router.post('/register', AuthController.register);
router.get('/login', AuthController.getLogin);
router.post('/login', AuthController.login);
router.get('/signout', isAuthenticated, AuthController.signout);

module.exports = router;