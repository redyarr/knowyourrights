const {User} = require('../models')

const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user_id) {
    return next();
  }
  res.redirect('/login');
};

const isAuthenticatedAdmin = (req, res, next) => {
  if (req.session && req.session.user_id) {
    User.findOne({where:{id: req.session.user_id}})
      .then(user => {
        if (user && user.role === 'admin') {
          return next();
        }
        res.redirect('/');
      })
      .catch(err => {
        console.error('Error in admin authentication:', err);
        res.redirect('/');
      });
  } else {
    res.redirect('/login');
  }
};

// const isAuthenticatedLawyer = (req, res, next) => {
//   if (req.session && req.session.user_id) {
//     User.findOne({where:{id: req.session.User.user_id}})
//     return next();
//   }
//   res.redirect('/');
// }

module.exports = { isAuthenticated, isAuthenticatedAdmin };
