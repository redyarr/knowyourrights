const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');

// Import controllers
const JobsController = require('../controllers/jobsController');

// Authentication routes
router.get('/', JobsController.getJobs);

module.exports = router;