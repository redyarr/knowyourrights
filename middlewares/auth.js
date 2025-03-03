const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user_id) {
    return next();
  }
  res.redirect('/user/login');
};

module.exports = { isAuthenticated };
