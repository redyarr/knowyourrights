const session = require('express-session');
const { User, Lawyer, Education, Contact, LawyerEducation } = require('../models');
const bcrypt = require('bcrypt');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  console.log("the secret is ");
  console.log(JWT_SECRET);
  console.log("++++++++++++++++++++");

exports.get = (req, res) =>{
    if (req.session.user) {
      if (req.session.user.role === 'admin') {
        return res.redirect('/admin/lawyers');
      }
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
    if (req.session.user.role === 'admin') {
      return res.redirect('/admin/lawyers');
    }
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
      return res.status(200).json({
      success: false,
      message: 'Email is required',
    });

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
      return res.status(200).json({
      success: false,
      message: 'Email already in use. Please use a different email address.',
    });
    }

    // Check if contact number already exists (for lawyers)
    if (role === 'lawyer' && contactNumber) {
      const existingContact = await Contact.findOne({ where: { number: contactNumber } });
      if (existingContact) {
        return res.status(200).json({
          success: true,
          message: 'Contact number already in use. Please use a different number.',
        });
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
        summary: summary || 'Default professional summary',
        verificationStatus: 'pending' // Set initial verification status
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
        return res.status(400).json({
          success: false,
          error: 'Error creating contact: ' + contactError.message
        });
      }
    }
//this session is for node.js application 
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
    
    //this session cookie is for Next.js application : 
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    } 

    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '1h' });

    console.log("the token is ");
    console.log(token);
    console.log("++++++++++++++++++++");

    res.cookie('token', token, {
      httpOnly: true,      // 👈 Prevent JS access
      secure: process.env.NODE_ENV === 'production',        // 👈 Only HTTPS in production
      sameSite: 'strict',  // 👈 Protect CSRF
      maxAge: 60 * 60 * 1000, // 1 hour in ms
      path: '/',
    });

    if (lawyer) {
      req.session.lawyer = lawyer;
      console.log("10. Lawyer-specific session info set");
    }

    // Send JSON response for API requests
    return res.status(200).json({
      success: true,
      user: userData,
      redirectUrl: user.role === 'admin' ? '/admin/lawyers' : '/'
    });

  } catch (error) {
    console.error("Error during registration process:", error.message);
    
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Get login form
exports.getLogin = (req, res) => {
      if (req.session.user) {
        if (req.session.user.role === 'admin') {
          return res.redirect('/admin/lawyers');
        }
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

    console.log("Checking user and password validation");
    if (!user) {
      console.log("User not found in database");
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    console.log("User found, validating password");
// Add additional validation and error handling for Postman requests
let isValidPassword = false;

// Check if password is provided
if (!password) {
  return res.status(400).json({
    success: false,
    error: 'Password is required'
  });
}

try {
  // Ensure both password and stored hash are strings
  const passwordString = String(password);
  const storedHash = String(user.password);
  
  isValidPassword = await bcrypt.compare(passwordString, storedHash);
  console.log("Password validation successful:", isValidPassword);
} catch (error) {
  console.error("Error validating password:", error);
  return res.status(500).json({
    success: false,
    error: 'Error validating password'
  });
}

console.log("Password validation result:", isValidPassword);

if (!isValidPassword) {
  console.log("Password validation failed");
  return res.status(401).json({
    success: false,
    error: 'Invalid email or password'
  });
}

    console.log("Password validation successful");

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

    //this session cookie is for Next.js application : 
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    } 

    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '1h' });

    res.cookie('token', token, {
      httpOnly: true,      // 👈 Prevent JS access
      secure: process.env.NODE_ENV === 'production',        // 👈 Only HTTPS in production
      sameSite: 'strict',  // 👈 Protect CSRF
      maxAge: 60 * 60 * 1000, // 1 hour in ms
      path: '/',
    });

    if (user.Lawyer) {
      req.session.lawyer = user.Lawyer;
      console.log("7. Lawyer session set:", req.session.lawyer);
    }

    return res.status(200).json({
      success: true,
      message: 'User logged in successfully',
      redirectUrl: user.role === 'admin' ? '/admin/lawyers' : '/'
    });

  } catch (error) {
    console.error("Error during login process:", error.message);
    return res.status(500).json({
      success: false,
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