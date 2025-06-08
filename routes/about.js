const express = require('express');
const router = express.Router();

// About page route
router.get('/', (req, res) => {
    res.render('about', {
        title: 'About Us - Know Your Rights',
        loggedInUserId: req.user ? req.user.id : null,
        user: req.user || null
    });
});

module.exports = router;