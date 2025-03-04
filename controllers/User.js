const { Users, Blogs } = require('../models');
const bcrypt = require('bcrypt');

exports.getAllUsers = function (req, res) {
    Users.findAll()
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
    const { name, email, password, userType } = req.body;
    console.log('Received sign up request:', { name, email, userType });
    
    // Create user with appropriate role based on userType
    const role = userType === 'lawyer' ? 'lawyer' : 'visitor';
    
    Users.create({ name, email, password, role })
        .then((user) => {
            console.log('User created successfully:', user);
            req.session.user_id = user.id;
            
            // If lawyer, redirect to complete lawyer profile
            if (role === 'lawyer') {
                res.redirect('/user/complete-lawyer-profile');
            } else {
                res.redirect(`/user/${user.id}`);
            }
        })
        .catch((err) => {
            console.error('Error during sign up:', err);
            res.status(500).send('Internal Server Error');
        });
};

exports.postCreateLawyer = (req, res) => {
    const { name, email, password, lawFirm, licenseNumber, contactNumber, city, country } = req.body;
    
    // First create the user with lawyer role
    Users.create({ name, email, password, role: 'lawyer' })
        .then((user) => {
            // Then create the lawyer profile
            return require('../models').Lawyer.create({
                userId: user.id,
                lawFirm,
                licenseNumber,
                contactNumber,
                city,
                country
            }).then(() => {
                req.session.user_id = user.id;
                res.redirect(`/user/${user.id}`);
            });
        })
        .catch((err) => {
            console.error('Error during lawyer sign up:', err);
            res.status(500).send('Internal Server Error');
        });
};

exports.getCompleteLawyerProfile = (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/user/login');
    }
    
    res.render('user/completeLawyerProfile', { 
        title: 'Complete Your Lawyer Profile',
        userId: req.session.user_id
    });
};

exports.postCompleteLawyerProfile = (req, res) => {
    if (!req.session.user_id) {
        return res.redirect('/user/login');
    }
    
    const { lawFirm, licenseNumber, contactNumber, city, country } = req.body;
    
    require('../models').Lawyer.create({
        userId: req.session.user_id,
        lawFirm,
        licenseNumber,
        contactNumber,
        city,
        country
    })
        .then(() => {
            res.redirect(`/user/${req.session.user_id}`);
        })
        .catch((err) => {
            console.error('Error completing lawyer profile:', err);
            res.status(500).send('Internal Server Error');
        });
};

exports.getUserLogin = (req, res) => {
    res.render('user/userLogin', { title: 'Sign In to LegalNet' });
};

exports.postUserLogin = (req, res) => {
    const { email, password, userType } = req.body;
    
    // If userType is specified, we can add role filtering
    const whereClause = { email };
    if (userType === 'lawyer') {
        whereClause.role = 'lawyer';
    }
    
    Users.findOne({ where: whereClause })
        .then(user => {
            if (!user) {
                return res.status(401).send('User not found');
            }
            bcrypt.compare(password, user.password)
                .then((isMatch) => {
                    if (!isMatch) {
                        return res.status(401).send('Password is wrong');
                    }
                    req.session.user_id = user.id;
                    res.redirect(`/user/${user.id}`);
                })
                .catch((err) => {
                    console.error('Error comparing passwords:', err);
                    res.status(500).send('Internal Server Error');
                });
            // if (password !== user.password) {
            //     return res.status(401).send('Password is wrong');
            // }
        })
        .catch((err) => {
            console.error('Error during login:', err);
            res.status(500).send('Internal Server Error');
        });
};

exports.getUserProfile = function (req, res) {
    const userId = req.params.id || req.session.user_id;
    if(req.session.user_id){console.log("going by session that",req.session.user_id);}
    if(req.params.id){console.log("No, going by param which: ",req.session.user_id);}
    
    if(req.session.user_id){
        console.log("user has session which is: "+req.session.user_id);
    } else{
        console.log("user has no session");
    }
    console.log("userId:");
    console.log(userId);
    
    Users.findOne({
        where: { id: userId },
        include: [
            { model: Blogs }
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
    
    Users.findByPk(userId)
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
    
    Users.findByPk(userId)
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