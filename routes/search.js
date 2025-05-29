const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');
const SearchController = require('../controllers/searchController');

// Search routes
router.get('/', SearchController.searchUsers);
router.get('/lawyers', SearchController.searchLawyersBySpecialty);
router.get('/api/users', isAuthenticated, SearchController.apiSearchUsers);

module.exports = router;