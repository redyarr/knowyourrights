const Users = require('../models/users');
const Lawyers = require('../models/Lawyers');

exports.getAllUsers = function (req, res) {
    Users.findAll()
        .then((users) => {
            // Render the users page with users data (name, email, role)
            res.render('user/allUsers', { users });
        })
        .catch((error) => {
            console.error('Error fetching users:', error);
            res.status(500).send('Internal Server Error');
        });
};

exports.getUserProfile = function (req, res) {
    const userId = req.params.id || req.session.user_id;
    Users.findOne({
        where: { user_id: userId },
    })
        .then((user) => {
            if (!user) {
                return res.status(404).send('User not found');
            }

            // Render the user's profile page with all details
            res.render('user/profile', { user });
        })
        .catch((error) => {
            console.error('Error fetching user profile:', error);
            res.status(500).send('Internal Server Error');
        });
};





exports.getUserSignUp = (req, res) => {
    res.render('user/createUser');
}

exports.postUserSignUp = (req, res) => {
    const { name, email, password , phone_number} = req.body;
    Users.create({ name, email, password, phone_number })
    .then(() => {
        res.redirect('/user/users');
    })
    .catch((err) => {
        console.log(err);
    });
}


exports.getUserLogin = (req, res) => {
    res.render('user/userLogin');
}


exports.postUserLogin = (req, res) => {
    const { email, password } = req.body;
    Users.findOne({ where: { email, password } }).then(user => {
        if (!user) {
            return res.status(401).send('Invalid email or password');
        }
        req.session.user_id = user.user_id;
        res.redirect(`/user/${req.session.user_id}`);
    })
    .catch((err) => {
        console.log(err);   
    });
}

