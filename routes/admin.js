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
router.get('/lawyers', AdminController.getAllLawyers);
router.get('/lawyers/:lawyerId', AdminController.viewLawyerDetails);
router.post('/lawyers/:lawyerId/approve', AdminController.approveLawyer);
router.post('/lawyers/:lawyerId/reject', AdminController.rejectLawyer);

module.exports = router;