const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { isAuthenticated } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/lawyerVerification');

// Apply authentication and admin middleware to all routes
router.use(isAuthenticated);
router.use(isAdmin);

// Admin dashboard
router.get('/', AdminController.dashboard);
router.get('/dashboard', AdminController.dashboard);

// Lawyer verification routes
// Get all lawyers
router.get('/lawyers', AdminController.getAllLawyers);

// Approve a lawyer by ID
router.post('/lawyers/:lawyerId/approve', AdminController.approveLawyer);

// Reject a lawyer by ID  
router.post('/lawyers/:lawyerId/reject', AdminController.rejectLawyer);

// Get details for a specific lawyer
router.get('/lawyers/:lawyerId', AdminController.viewLawyerDetails);

module.exports = router;