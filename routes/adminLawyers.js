const express = require('express');
const router = express.Router();
const adminLawyerController = require('../controllers/adminLawyer');
// TODO: Add middleware for admin authentication/authorization

// Get all pending lawyers
router.get('/pending', adminLawyerController.getPendingLawyers);

// Approve a lawyer
router.post('/approve/:id', adminLawyerController.approveLawyer);

// Decline a lawyer
router.post('/decline/:id', adminLawyerController.declineLawyer);

// Get lawyer details
router.get('/:id', adminLawyerController.getLawyerDetails);

module.exports = router;