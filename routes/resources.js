const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middlewares/auth');

// Family Law Resource Page
router.get('/family-law', (req, res) => {
    res.render('resources/family-law', {
        title: 'Family Law Guide - Know Your Rights',
        user: req.session.user || null
    });
});

// Employment Rights Resource Page
router.get('/employment', (req, res) => {
    res.render('resources/employment', {
        title: 'Employment Rights Guide - Know Your Rights',
        user: req.session.user || null
    });
});

// Consumer Protection Resource Page
router.get('/consumer', (req, res) => {
    res.render('resources/consumer', {
        title: 'Consumer Protection Guide - Know Your Rights',
        user: req.session.user || null
    });
});

module.exports = router;