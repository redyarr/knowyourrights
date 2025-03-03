const session = require('express-session');
const { sequelize } = require('../models');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const myStore = new SequelizeStore({ db: sequelize });

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || "my secret",
    resave: false,
    saveUninitialized: false,
    store: myStore
});

const setLoggedInUser = (req, res, next) => {
    if (req.session && req.session.user_id) {
        res.locals.loggedInUserId = req.session.user_id;
    } else {
        res.locals.loggedInUserId = null;
    }
    next();
};

module.exports = {
    sessionMiddleware,
    setLoggedInUser
};