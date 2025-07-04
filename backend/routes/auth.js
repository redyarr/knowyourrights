const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');
const passport = require('passport');

// Import controllers
const AuthController = require('../controllers/authController');

// Authentication routes
router.get('/', AuthController.get); // no need to frontend could be removed
router.get('/register', AuthController.getRegister); 
router.post('/register', AuthController.register); 
router.get('/login', AuthController.getLogin);
router.post('/login', AuthController.login);
router.get('/logout', isAuthenticated, AuthController.signout); // no need to frontend could be removed
router.post('/signout', isAuthenticated, AuthController.signout); // no need to frontend could be removed

// Google OAuth routes
router.get('/google', (req, res, next) => {
  // Check if Google OAuth is properly configured
  if (!process.env.GOOGLE_CLIENT_ID || 
      !process.env.GOOGLE_CLIENT_SECRET || 
      process.env.GOOGLE_CLIENT_ID === 'placeholder_client_id' ||
      process.env.GOOGLE_CLIENT_SECRET === 'placeholder_client_secret') {
    return res.redirect('/login?error=Google OAuth is not configured. Please contact the administrator.');
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication
    req.session.user = {
      id: req.user.id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      role: req.user.role
    };
    
    if (req.user.role === 'admin') {
      res.redirect('/admin/lawyers');
    } else {
      res.redirect('/feed');
    }
  }
);

module.exports = router;