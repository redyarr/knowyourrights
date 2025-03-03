// const { User, Blog } = require('../models');
const User = require('../models/Users')
const Blog = require('../models/Blogs') 
const bcrypt = require('bcrypt');

exports.getAllUsers = function (req, res) {
    User.findAll()
        .then((users) => {
            // Render the users page with users data (name, email, role)
            res.render('user/users', { users });
        })
        .catch((error) => {
            console.error('Error fetching users:', error);
            res.status(500).send('Internal Server Error');
        });
};

exports.getUserSignUp = (req, res) => {
    res.render('user/createUser', { title: 'Join LegalNet' });
};

exports.postUserSignUp = (req, res) => {
    const { name, email, password } = req.body;
    console.log(`addin user who name is ${name} and email is ${email} and pass: ${password}`);
    
    User.create({ name, email, password })
        .then((user) => {
            req.session.user_id = user.id;
            
            console.log("Session Data:", req.session); // Log full session data
            res.redirect(`/user/${user.id}`);
        })
        .catch((err) => {
            console.error('Error during sign up:', err);
            res.status(500).send('Internal Server Error');
        });
};

exports.getUserLogin = (req, res) => {
    res.render('user/userLogin', { title: 'Sign In to LegalNet' });
};

exports.postUserLogin = (req, res) => {
    const { email, password } = req.body;
    User.findOne({ where: { email } })
        .then(user => {
            if (!user) {
                return res.status(401).send('User not found');
            }
            console.log("User found");
            bcrypt.compare(password, user.password)
                .then((isMatch) => {
                    if (!isMatch) {
                        return res.status(401).send('Password is wrong');
                    }
                    console.log("Password correct");

                    req.session.user_id = user.id;
                    res.redirect(`/user/${user.id}`);
                })
                .catch((err) => {
                    console.error('Error comparing passwords:', err);
                    res.status(500).send('Internal Server Error');
                });
        })
        .catch((err) => {
            console.error('Error during login:', err);
            res.status(500).send('Internal Server Error');
        });
};

exports.getUserProfile = function (req, res) {
    const userId = req.params.id || req.session.user_id;
    if(req.session.user_id){
        console.log("user has session which is: "+req.session.user_id);
    } else{
        console.log("user has no session");
    }
    console.log("userId:");
    console.log(userId);
    
    User.findOne({
        where: { id: userId },
        include: [
            { model: Blog }
        ]
    })
        .then((user) => {
            if (!user) {
                return res.status(404).send('User not found');
            }
            // Render the user's profile page with all details
            console.log("user data:");
            console.log(user);
            
            res.render('user/profile', { 
                title: user.name + ' | LegalNet',
                user, 
                loggedInUserId: req.session.user_id 
            });
        })
        .catch((error) => {
            console.error('Error fetching user profile:', error);
            res.status(500).send('Internal Server Error');
        });
};

exports.getEditProfile = function (req, res) {
    const userId = req.params.id;
    
    // Check if the logged-in user is trying to edit their own profile
    if (req.session.user_id != userId) {
        return res.status(403).send('Unauthorized');
    }
    
    User.findByPk(userId)
        .then((user) => {
            if (!user) {
                return res.status(404).send('User not found');
            }
            
            res.render('user/editProfile', { 
                title: 'Edit Profile',
                user 
            });
        })
        .catch((error) => {
            console.error('Error fetching user for edit:', error);
            res.status(500).send('Internal Server Error');
        });
};

exports.postEditProfile = function (req, res) {
    const userId = req.params.id;
    
    // Check if the logged-in user is trying to edit their own profile
    if (req.session.user_id != userId) {
        return res.status(403).send('Unauthorized');
    }
    
    const { name, email } = req.body;
    
    User.findByPk(userId)
        .then((user) => {
            if (!user) {
                return res.status(404).send('User not found');
            }
            
            return user.update({ name, email });
        })
        .then(() => {
            res.redirect(`/user/${userId}`);
        })
        .catch((error) => {
            console.error('Error updating user profile:', error);
            res.status(500).send('Internal Server Error');
        });
};

exports.UserLogout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).send('Internal Server Error');
        }
        console.log("Session destroyed");
        res.redirect('/user/login');
    });
};