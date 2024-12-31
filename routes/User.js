const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

// Route to fetch all users and their data
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserProfile);

module.exports = router;
