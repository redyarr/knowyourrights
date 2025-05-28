const session = require('express-session');
const { User, Lawyer, Education, Contact, LawyerEducation } = require('../models');
const bcrypt = require('bcrypt');
const fs = require('fs');

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
    console.log(educations);
    res.render('auth/register', {
      title: 'Join Legal Network',
      error: null,
      educations: educations
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
    console.log("Request body:", req.body); // Log the entire request body to debug
    
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      role,
      lawFirm,
      badgeNumber,
      badgeIssueDate,
      badgeIssuingAuthority, // Now serves as the authority level
      summary,
      contactNumber,
      // Education fields: dropdown selections and custom inputs
      universitySelect, // dropdown for university
      university,       // custom input if "other" selected
      degree
    } = req.body;

    // Validate required fields
    if (!email) {
      throw new Error('Email is required');
    }

    // Handle file upload if present
    let badgeDocPath = null;
    if (req.files && req.files.badgeUpload) {
      const badgeFile = req.files.badgeUpload;
      const uploadDir = 'public/uploads/badges/';
      const fileName = `${Date.now()}-${badgeFile.name}`;
      const fullPath = `${uploadDir}${fileName}`;
      
      // Ensure directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      // Move the file
      await badgeFile.mv(fullPath);
      // Store the path without 'public/' prefix for browser access
      badgeDocPath = `/uploads/badges/${fileName}`;
      console.log("Badge document uploaded to:", fullPath);
      console.log("Badge document path stored as:", badgeDocPath);
    }

    console.log("2. Received form data:", req.body);

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('Email already in use. Please use a different email address.');
    }

    // Check if contact number already exists (for lawyers)
    if (role === 'lawyer' && contactNumber) {
      const existingContact = await Contact.findOne({ where: { number: contactNumber } });
      if (existingContact) {
        throw new Error('Contact number already in use. Please use a different number.');
      }
    }

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

      // No need to check for license number as it's been removed

      // Create lawyer record with badge information
      lawyer = await Lawyer.create({
        userId: user.id,
        lawFirm: lawFirm || null, // Make lawFirm optional
        badgeNumber,
        badgeIssueDate,
        badgeIssuingAuthority, // This now serves as the authority level
        summary: summary || 'Default professional summary'
      });
      console.log("5. Lawyer profile created with ID:", lawyer.id);

      // If badge document was uploaded, save it to the lawyer_docs table
      if (badgeDocPath) {
        const lawyerDoc = require('../models/lawwyerDoc'); // Fixed: changed from 'lawwyerDoc' to 'lawwyerDoc'
        await lawyerDoc.create({
          lawyerId: lawyer.id,
          idPath: badgeDocPath
        });
        console.log("Badge document associated with lawyer");
      }

      // Determine university value
      const universityValue = (universitySelect === 'other') ? university : universitySelect;

      // Look up an existing education record with these details
      let education = await Education.findOne({
        where: {
          university: universityValue,
          degree: degree
        }
      });

      if (!education) {
        // If not found, create a new Education record
        education = await Education.create({
          university: universityValue,
          degree: degree
        });
        console.log("6. New Education record created with ID:", education.id);
      } else {
        console.log("6. Existing Education record found with ID:", education.id);
      }

      // Manually create the association between lawyer and education
      await LawyerEducation.create({
        lawyerId: lawyer.id,
        educationId: education.id
      });
      console.log("7. Education associated with lawyer");

      // Create the contact record
      try {
        await Contact.create({
          userId: user.id,
          number: contactNumber
        });
        console.log("8. Contact record created");
      } catch (contactError) {
        // If contact creation fails, clean up the created records
        await LawyerEducation.destroy({ where: { lawyerId: lawyer.id } });
        await Lawyer.destroy({ where: { id: lawyer.id } });
        await User.destroy({ where: { id: user.id } });
        throw new Error('Error creating contact: ' + contactError.message);
      }
    }

    // Set session information for both regular users and lawyers
    req.session.user_id = user.id;
    req.session.user = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    };
    console.log("9. Session set for user", req.session);

    if (lawyer) {
      req.session.lawyer = lawyer;
      console.log("10. Lawyer-specific session info set");
    }

    res.redirect('/feed');
    console.log("11. Registration process completed, redirecting to '/feed'");
  } catch (error) {
    console.error("Error during registration process:", error.message);

    // Fetch education data to pass to the view
    const educations = await Education.findAll();

    res.render('auth/register', {
      title: 'Join Legal Network',
      error: error.message,
      educations
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
    console.log("1. Starting login process");
    const { email, password } = req.body;
    console.log("2. Received login data:", { email });

    const user = await User.findOne({ 
      where: { email },
      include: [{ model: Lawyer }]
    });
    console.log("3. User lookup result:", user);

    if (!user || !(await user.validPassword(password))) {
      console.log("4. Invalid email or password");
      throw new Error('Invalid email or password');
    }

    console.log("5. Valid user found, setting session");
    req.session.user_id = user.id;
    req.session.user = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    };
    console.log("6. User session set:", req.session.user);

    if (user.Lawyer) {
      req.session.lawyer = user.Lawyer;
      console.log("7. Lawyer session set:", req.session.lawyer);
    }

    console.log("8. Redirecting to '/feed'");
    res.redirect('/feed');
  } catch (error) {
    console.error("Error during login process:", error.message);
    res.render('auth/login', {
      title: 'Sign In | Legal Network',
      error: error.message
    });
  }
};

// Logout user
exports.signout = (req, res) => {
  try {
    console.log("1. Starting signout process");
    req.session.destroy((err) => {
      if (err) {
        console.error("2. Error destroying session:", err.message);
        return res.status(500).send("Failed to sign out. Please try again.");
      }
      console.log("3. Session destroyed successfully");
      res.redirect('/');
      console.log("4. Redirected to '/' after signout");
    });
  } catch (error) {
    console.error("Error during signout process:", error.message);
    res.status(500).send("An unexpected error occurred during signout.");
  }
};