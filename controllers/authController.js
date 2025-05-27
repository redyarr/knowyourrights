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
      university,    // updated field
      degreeLevel    // updated field
    } = req.body;

  console.log(

    "2. Received registration data:",
    
    {
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
      degreeLevel
    }

  );
    // Basic validation
    if (!firstName || !lastName || !email || !password || !lawFirm || !licenseNumber || !university || !degreeLevel) {
      return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    // Check if user with this email already exists
    const existingUser = await User.findOne({ where: { email: email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role
    });

    // Create new lawyer
    const lawyer = await Lawyer.create({
      userId: user.id,
      lawFirm,
      licenseNumber,
      summary
    });

    // Provide default values for required Education fields

    const degreeValue = degreeLevel;
    const universityValue = university;

    // Look up an existing education record with these details
    let education = await Education.findOne({
      where: {
        university: universityValue,
        degree: degreeValue
      }
    });

    if (!education) {
      // If not found, create a new Education record
      education = await Education.create({
        university: universityValue,
        college: collegeValue,
        department: departmentValue,
        degree: degreeValue
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

    res.status(201).json({ message: 'User registered successfully.', user });
  }
  catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
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


// Export other functions if needed