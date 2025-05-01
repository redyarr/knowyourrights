const session = require('express-session');
const { sequelize } = require('../models');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const myStore = new SequelizeStore({ db: sequelize });

myStore.sync().catch(err => {
    console.error('Failed to sync session store:', err);
});

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || "my secret",
    resave: false,
    saveUninitialized: false,
    store: myStore,
});

/**
 * Middleware to set the logged-in user ID in response locals.
 */
const setLoggedInUser = (req, res, next) => {
    console.log('setLoggedInUser middleware triggered');
    
    if (req.session) {
        console.log('Session exists:', req.session);
        
        if (req.session.user_id) {
            console.log('User ID found in session:', req.session.user_id);
            res.locals.loggedInUserId = req.session.user_id;
            
            // Check if user object exists in session
            if (req.session.user) {
                res.locals.userDetails = req.session.user;
                res.locals.userRole = req.session.user.role;
                res.locals.user = req.session.user; // Add user directly to locals for templates
                console.log('User details:', req.session.user);
                console.log("User Role:", res.locals.userRole);
            } else {
                // Fetch user from database if not in session
                const { User } = require('../models');
                User.findByPk(req.session.user_id)
                    .then(user => {
                        if (user) {
                            // Store user in session for future requests
                            req.session.user = user;
                            res.locals.userDetails = user;
                            res.locals.userRole = user.role;
                            res.locals.user = user; // Add user directly to locals for templates
                            console.log('User details fetched from DB:', user);
                        }
                    })
                    .catch(err => {
                        console.error('Error fetching user:', err);
                    });
            }
            
        } else {
            console.log('No user ID found in session');
            res.locals.loggedInUserId = null;
        }
    } else {
        console.log('No session found');
        res.locals.loggedInUserId = null;
    }
    
    next();
};

const setLoggedInLawyer = (req, res, next) => {
    if (req.session && req.session.user_id) {
        res.locals.loggedInLawyerId = req.session.user_id;
        res.locals.lawyer = req.session.lawyer;
    } else {
        res.locals.loggedInLawyerId = null;
    }
    next();
};

const setAdminLoggedInUser = (req, res, next) => {
    if (req.session && req.session.user_id) {
        res.locals.adminLoggedInUserId = req.session.user_id;
        res.locals.user = req.session.user;
    } else {
        res.locals.adminLoggedInUserId = null;
    }
    next();
};


// const setAdminLoged

module.exports = {
    sessionMiddleware,
    setLoggedInUser,
};