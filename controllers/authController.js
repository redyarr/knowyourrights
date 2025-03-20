const session = require('express-session');
const { User, Lawyer, Education, Contact, LawyerEducation } = require('../models');
const bcrypt = require('bcrypt');

exports.get = (req, res) =>{
    if (req.session.user) {
    return res.redirect('/feed');
  }
  res.render("index", {
    title: 'Join Legal Network',
    error: null
  })
}

// Get register form
exports.getRegister = async (req, res) => {
  if (req.session.user) {
    return res.redirect('/feed');
  }
  try {
    const educations = await Education.findAll();
    res.render('auth/register', {
      title: 'Join Legal Network',
      error: null,
      educations
    });
  } catch (error) {
    console.error("Error fetching educations:", error.message);
    res.render('auth/register', {
      title: 'Join Legal Network',
      error: 'Failed to load education data'
    });
  }
};

// Register a new user
exports.getRegister = async (req, res) => {
  if (req.session.user) {
    return res.redirect('/feed');
  }
  try {
    const educations = await Education.findAll();
    res.render('auth/register', {
      title: 'Join Legal Network',
      error: null,
      educations
    });
  } catch (error) {
    console.error("Error fetching educations:", error.message);
    res.render('auth/register', {
      title: 'Join Legal Network',
      error: 'Failed to load education data'
    });
  }
};

// Register a new user (with education record handling for lawyers)
exports.getRegister = async (req, res) => {
  if (req.session.user) {
    return res.redirect('/feed');
  }
  try {
    const educations = await Education.findAll();
    res.render('auth/register', {
      title: 'Join Legal Network',
      error: null,
      educations
    });
  } catch (error) {
    console.error("Error fetching educations:", error.message);
    res.render('auth/register', {
      title: 'Join Legal Network',
      error: 'Failed to load education data'
    });
  }
};

// Register a new user (with extended education handling for lawyers)
exports.register = async (req, res) => {
  try {
    console.log("1. Starting registration process");

    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      role,
      lawFirm,
      licenseNumber,
      summary,       // from the form
      contactNumber,
      // Education fields: dropdown selections and custom inputs
      universitySelect, // dropdown for university
      university,       // custom input if "other" selected
      collegeSelect,    // dropdown for college
      college,          // custom input if "other" selected
      departmentSelect, // dropdown for department
      department,       // custom input if "other" selected
      degree
    } = req.body;

    console.log("2. Received form data:", req.body);

    // Create the user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role
    });
    console.log("3. User created with ID:", user.id);

    let lawyer = null;

    // For lawyer registration, create lawyer profile, education record, and contact info
    if (role === 'lawyer') {
      console.log("4. Registering as a lawyer");

      lawyer = await Lawyer.create({
        userId: user.id,
        lawFirm,
        licenseNumber,
        summery: summary || '' // Note: model expects 'summery'
      });
      console.log("5. Lawyer profile created with ID:", lawyer.id);

      // Determine which values to use for each education field:
      const universityValue = (universitySelect === 'other') ? university : universitySelect;
      const collegeValue = (collegeSelect === 'other') ? college : collegeSelect;
      const departmentValue = (departmentSelect === 'other') ? department : departmentSelect;

      // Look up an existing education record with these details
      let education = await Education.findOne({
        where: {
          university: universityValue,
          college: collegeValue,
          department: departmentValue,
          degree: degree
        }
      });

      if (!education) {
        // If not found, create a new Education record
        education = await Education.create({
          university: universityValue,
          college: collegeValue,
          department: departmentValue,
          degree: degree
        });
        console.log("6. New Education record created with ID:", education.id);
      } else {
        console.log("6. Existing Education record found with ID:", education.id);
      }

      // Associate the education record with the lawyer
      await lawyer.addEducation(education);
      console.log("7. Education associated with lawyer");

      // Create the contact record
      await Contact.create({
        userId: user.id,
        number: contactNumber
      });
      console.log("8. Contact record created");
    }

    // Set session information for both regular users and lawyers
    req.session.user_id = user.id;
    req.session.user = user;
    console.log("9. Session set for user", req.session);

    if (lawyer) {
      req.session.lawyer = lawyer;
      console.log("10. Lawyer-specific session info set");
    }

    res.redirect('/');
    console.log("11. Registration process completed, redirecting to '/'");
  } catch (error) {
    console.error("Error during registration process:", error.message);
    res.render('auth/register', {
      title: 'Join Legal Network',
      error: error.message
    });
  }
};




// Get login form
exports.getLogin = (req, res) => {
      if (req.session.user) {
        return res.redirect('/feed');
      }
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
exports.signout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};