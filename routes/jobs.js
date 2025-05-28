const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');

// Import controllers
const JobsController = require('../controllers/jobsController');

// Job routes
router.get('/', JobsController.getJobs);

// Job creation routes (protected by authentication)
router.get('/create', isAuthenticated, JobsController.getCreateJob);
router.post('/create', isAuthenticated, JobsController.createJob);

// Job details and application routes
router.get('/:id', JobsController.getJobDetails);
router.post('/:id/apply', isAuthenticated, JobsController.applyForJob);
router.post('/:jobId/accept/:applicationId', isAuthenticated, JobsController.acceptLawyer);

// Job deletion route (protected by authentication)
router.delete('/:id', isAuthenticated, JobsController.deleteJob);

module.exports = router;