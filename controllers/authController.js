const session = require('express-session');
const { User, Lawyer, Education, Contact } = require('../models');
const bcrypt = require('bcrypt');

// Get register form
exports.getRegister = (req, res) => {
  res.render('auth/register', {
    title: 'Join Legal Network',
    error: null
  });
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      role,
      lawFirm,
      licenseNumber,
      summary,
      contactNumber,
      university,
      college,
      department,
      degree
    } = req.body;
    
    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role
    });

    // If registering as a lawyer, create lawyer profile and related records
    if (role === 'lawyer') {
      const lawyer = await Lawyer.create({
        userId: user.id,
        lawFirm,
        licenseNumber,
        summery: summary || '' // Note: Model uses 'summery' instead of 'summary'
      });

      // Create education record
      const education = await Education.create({
        university,
        college,
        department,
        degree
      });

      // Associate education with lawyer
      await lawyer.addEducation(education);

      // Create contact record
      await Contact.create({
        userId: user.id,
        number: contactNumber
      });
    }

    req.session.user_id = user.id;
    req.session.user = user;
    res.redirect('/');
  } catch (error) {
    res.render('auth/register', {
      title: 'Join Legal Network',
      error: error.message
    });
  }
};

// Get login form
exports.getLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Sign In | Legal Network',
    user:req.session.user,
    error: null
  });
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ 
      where: { email },
      include: [{ model: Lawyer }]
    });

    if (!user || !(await user.validPassword(password))) {
      throw new Error('Invalid email or password');
    }

    req.session.user_id = user.id;
    req.session.user = user;
    res.redirect('/');
  } catch (error) {
    res.render('auth/login', {
      title: 'Sign In | Legal Network',
      error: error.message
    });
  }
};

// Logout user
exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/user/login');
};