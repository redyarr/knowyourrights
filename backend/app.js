const express = require('express');
const http = require('http')
const { Server } = require('socket.io')

const bodyParser = require('body-parser');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const fileUpload = require('express-fileupload');
require('dotenv').config();
const { sequelize } = require('./models');
const passport = require('./config/passport');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Import routes
const AboutRouter = require('./routes/about.js');
const AdminRouter = require('./routes/admin.js');
const AuthRouter = require('./routes/auth.js');
const FeedbackRouter = require('./routes/feedback.js');
const FeedRouter = require('./routes/feed.js');
const JobsRouter = require('./routes/jobs.js');
const MessagingRouter = require('./routes/messaging.js');
const MyNetworkRouter = require('./routes/mynetwork.js');
const NotificationsRouter = require('./routes/notifications.js');
const ProfileRouter = require('./routes/profile.js');
const ResourcesRouter = require('./routes/resources.js');
const SearchRouter = require('./routes/search.js');
const SeedRouter = require('./util/seed.js');

// Import session configuration
const { sessionMiddleware, setLoggedInUser } = require('./middlewares/session');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: 'http://localhost:3000',  
  credentials: true                 
}));
app.use(cookieParser());


// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Add JSON body parser for API requests
app.use(methodOverride('_method', { methods: ['POST', 'GET'] }));
app.use(express.static(path.join(__dirname, 'public')));

// File upload middleware - only use for routes that don't use multer
app.use(function(req, res, next) {
  // Skip fileUpload middleware for routes that use multer
  if (req.url.includes('/create-post') || req.url.includes('/uploads') || req.url.includes('/upload-profile-image')) {
    return next();
  }
  
  // Apply fileUpload middleware for other routes
  fileUpload({
    createParentPath: true,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
    abortOnLimit: true,
    responseOnLimit: 'File size is too large. Max size is 5MB.'
  })(req, res, next);
});

// Use session middleware
app.use(sessionMiddleware);
app.use(setLoggedInUser);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// View engine
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(expressLayouts); // Enable layouts
app.set('layout', 'layouts/main'); // Set default layout

// Using routes
app.use('/', AuthRouter); // Authenticate the user and redirect to route '/feed'
app.use('/about', AboutRouter); // About us page
app.use('/admin', AdminRouter);
app.use('/feed', FeedRouter); // Show all posts as feed
app.use('/feedback', FeedbackRouter); // Lawyer feedback system
app.use('/jobs', JobsRouter);
app.use('/messaging', MessagingRouter); // Handles all messaging routes including conversations
app.use('/mynetwork', MyNetworkRouter);
app.use('/notifications', NotificationsRouter);
app.use('/in', ProfileRouter); // Redirect route '/in/:user_id'
app.use('/resources', ResourcesRouter); // Legal resource pages
app.use('/search', SearchRouter); // Search for users
app.use('/seed', SeedRouter);

// { force: true }
sequelize.sync({ force: false })
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to sync database:', err);
    });