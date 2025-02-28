

const express = require('express');
const router = express.Router();
const LawyersController = require('../controllers/Lawyer');

// Route to get all lawyers

router.get('/lawyers', LawyersController.getAllLawyers);

router.post('/addLawyer', LawyersController.addLawyer);

router.get('/lawyerForm', LawyersController.getLawyerform);



module.exports = router;

