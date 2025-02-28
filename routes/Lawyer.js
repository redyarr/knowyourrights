const express = require('express');
const router = express.Router();
const { User, Lawyer } = require('../models');

// Middleware to check if user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user_id) {
    return next();
  }
  res.redirect('/user/login');
};

// Middleware to check if user is a lawyer
const isLawyer = async (req, res, next) => {
  if (!req.session || !req.session.user_id) {
    return res.redirect('/user/login');
  }
  
  try {
    const user = await User.findByPk(req.session.user_id);
    if (user && user.role === 'lawyer') {
      return next();
    }
    res.status(403).send('Access denied. Only lawyers can access this page.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

// Get all lawyers
router.get('/', async (req, res) => {
  try {
    const lawyers = await Lawyer.findAll({
      include: [{ model: User, attributes: ['name', 'email'] }]
    });
    
    res.render('lawyer/index', { 
      title: 'Lawyers',
      lawyers
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Get lawyer registration form
router.get('/register', isAuthenticated, async (req, res) => {
  try {
    // Check if user is already a lawyer
    const existingLawyer = await Lawyer.findOne({ 
      where: { userId: req.session.user_id } 
    });
    
    if (existingLawyer) {
      return res.redirect('/lawyer/profile');
    }
    
    res.render('lawyer/register', { title: 'Register as Lawyer' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Register as lawyer
router.post('/register', isAuthenticated, async (req, res) => {
  try {
    const { lawFirm, licenseNumber, contactNumber, city, country } = req.body;
    
    // Check if user is already a lawyer
    const existingLawyer = await Lawyer.findOne({ 
      where: { userId: req.session.user_id } 
    });
    
    if (existingLawyer) {
      return res.redirect('/lawyer/profile');
    }
    
    // Create lawyer profile
    await Lawyer.create({
      userId: req.session.user_id,
      lawFirm,
      licenseNumber,
      contactNumber,
      city,
      country
    });
    
    // Update user role
    await User.update(
      { role: 'lawyer' },
      { where: { id: req.session.user_id } }
    );
    
    res.redirect('/lawyer/profile');
  } catch (error) {
    console.error(error);
    res.render('lawyer/register', { 
      title: 'Register as Lawyer',
      error: 'Registration failed'
    });
  }
});

// Get lawyer profile
router.get('/profile', isAuthenticated, isLawyer, async (req, res) => {
  try {
    const lawyer = await Lawyer.findOne({
      where: { userId: req.session.user_id },
      include: [{ model: User, attributes: ['name', 'email'] }]
    });
    
    if (!lawyer) {
      return res.redirect('/lawyer/register');
    }
    
    res.render('lawyer/profile', { 
      title: 'Lawyer Profile',
      lawyer
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Get lawyer edit form
router.get('/edit', isAuthenticated, isLawyer, async (req, res) => {
  try {
    const lawyer = await Lawyer.findOne({
      where: { userId: req.session.user_id }
    });
    
    if (!lawyer) {
      return res.redirect('/lawyer/register');
    }
    
    res.render('lawyer/edit', { 
      title: 'Edit Lawyer Profile',
      lawyer
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Update lawyer profile
router.put('/update', isAuthenticated, isLawyer, async (req, res) => {
  try {
    const { lawFirm, licenseNumber, contactNumber, city, country } = req.body;
    
    const lawyer = await Lawyer.findOne({
      where: { userId: req.session.user_id }
    });
    
    if (!lawyer) {
      return res.redirect('/lawyer/register');
    }
    
    await lawyer.update({
      lawFirm,
      licenseNumber,
      contactNumber,
      city,
      country
    });
    
    res.redirect('/lawyer/profile');
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

// Get single lawyer
router.get('/:id', async (req, res) => {
  try {
    const lawyer = await Lawyer.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['name', 'email'] }]
    });
    
    if (!lawyer) {
      return res.status(404).send('Lawyer not found');
    }
    
    res.render('lawyer/show', { 
      title: 'Lawyer Details',
      lawyer
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

module.exports = router;