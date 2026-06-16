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
const setLoggedInUser = async (req, res, next) => {
    console.log('setLoggedInUser middleware triggered');

    if (req.session) {

        if (req.session.user_id) {
            res.locals.loggedInUserId = req.session.user_id;

            // Check if user object exists in session
            if (req.session.user) {
                res.locals.userDetails = req.session.user;
                res.locals.userRole = req.session.user.role;
                res.locals.user = req.session.user; // Add user directly to locals for templates

                // Calculate unread message count for navbar
                try {
                    const { Message } = require('../models');
                    const unreadMessageCount = await Message.count({
                        where: {
                            receiverId: req.session.user_id,
                            isRead: false
                        }
                    });
                    res.locals.unreadMessageCount = unreadMessageCount;
                    console.log('Unread message count:', unreadMessageCount);
                } catch (error) {
                    console.error('Error calculating unread message count:', error);
                    res.locals.unreadMessageCount = 0;
                }

            } else {
                // Fetch user from database if not in session
                const { User, Message } = require('../models');
                try {
                    const user = await User.findByPk(req.session.user_id);
                    if (user) {
                        // Store user in session for future requests
                        req.session.user = user;
                        res.locals.userDetails = user;
                        res.locals.userRole = user.role;
                        res.locals.user = user; // Add user directly to locals for templates

                        // Calculate unread message count for navbar
                        const unreadMessageCount = await Message.count({
                            where: {
                                receiverId: req.session.user_id,
                                isRead: false
                            }
                        });
                        res.locals.unreadMessageCount = unreadMessageCount;
                        console.log('Unread message count:', unreadMessageCount);
                    }
                } catch (err) {
                    console.error('Error fetching user or calculating unread messages:', err);
                    res.locals.unreadMessageCount = 0;
                }
            }

        } else {
            console.log('No user ID found in session');
            res.locals.loggedInUserId = null;
            res.locals.unreadMessageCount = 0;
        }
    } else {
        console.log('No session found');
        res.locals.loggedInUserId = null;
        res.locals.unreadMessageCount = 0;
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