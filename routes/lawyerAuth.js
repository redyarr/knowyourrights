const express = require('express');
const router = express.Router();
const lawyerAuthController = require('../controllers/lawyerAuth');

// Lawyer Registration Route
router.post('/register', lawyerAuthController.registerLawyer);

// Lawyer Resubmission Route
router.post('/resubmit/:id', lawyerAuthController.resubmitLawyer);

module.exports = router;