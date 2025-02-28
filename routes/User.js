const express = require('express');
const router = express.Router();
const UserController = require('../controllers/User');

// Route to fetch all users and their data
router.get('/users', UserController.getAllUsers);

router.get('/create', UserController.getUserSignUp);
router.post('/create', UserController.postUserSignUp);

router.get('/login', UserController.getUserLogin);
router.post('/login', UserController.postUserLogin);

router.post('/logout', UserController.UserLogout)

router.get('/:id', UserController.getUserProfile);

module.exports = router;
