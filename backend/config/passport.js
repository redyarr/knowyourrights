const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `http://localhost:${process.env.PORT || 3000}/auth/google/callback`
  }, async (accessToken, refreshToken, profile, done) => {
  try {
    // Check if user already exists with this Google ID
    let user = await User.findOne({ where: { googleId: profile.id } });
    
    if (user) {
      // User exists, return user
      return done(null, user);
    }
    
    // Check if user exists with same email
    user = await User.findOne({ where: { email: profile.emails[0].value } });
    
    if (user) {
      // User exists with same email, link Google account
      user.googleId = profile.id;
      await user.save();
      return done(null, user);
    }
    
    // Create new user
    const newUser = await User.create({
      googleId: profile.id,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      email: profile.emails[0].value,
      profilePicture: profile.photos[0].value,
      role: 'user', // Default role
      isVerified: true // Google accounts are considered verified
    });
    
    return done(null, newUser);
  } catch (error) {
    console.error('Error in Google Strategy:', error);
    return done(error, null);
  }
  }));
} else {
  console.warn('Google OAuth credentials not found. Google login will not be available.');
}

module.exports = passport;