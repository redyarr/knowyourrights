const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { isAuthenticated } = require('../middlewares/auth');

// Submit feedback for a lawyer
router.post('/submit', isAuthenticated, feedbackController.submitFeedback);

// Get all feedback for a specific lawyer
router.get('/lawyer/:lawyerId', feedbackController.getLawyerFeedback);

// Get all feedback submitted by the logged-in user
router.get('/user', isAuthenticated, feedbackController.getUserFeedback);

// Delete feedback
router.delete('/:feedbackId', isAuthenticated, feedbackController.deleteFeedback);

module.exports = router;