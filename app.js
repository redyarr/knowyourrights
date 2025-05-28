const express = require('express');
const http = require('http')
const {Server} = require('socket.io')

const bodyParser = require('body-parser');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const fileUpload = require('express-fileupload');
require('dotenv').config();
const {sequelize} = require('./models');

// Import routes
const AuthRouter = require('./routes/auth.js')
const FeedRouter = require('./routes/feed.js');
const MyNetwork = require('./routes/mynetwork.js');
const ProfileRouter = require('./routes/profile.js');
const JobsRouter = require('./routes/jobs.js');
const MessaginRouter = require('./routes/messagin.js');
const NotificationsRouter = require('./routes/notifications.js');
const FeedbackRouter = require('./routes/feedback.js');
const SearchRouter = require('./routes/search.js');
const storeRouter = require('./util/seed.js');

// Import session configuration
const { sessionMiddleware, setLoggedInUser } = require('./middlewares/session');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // Add JSON body parser for API requests
app.use(methodOverride('_method', { methods: ['POST', 'GET'] }));
app.use(express.static(path.join(__dirname, 'public')));

// File upload middleware - only use for routes that don't use multer
app.use(function(req, res, next) {
  // Skip fileUpload middleware for routes that use multer
  if (req.path.includes('/create-post') || req.path.includes('/uploads')) {
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

// View engine
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(expressLayouts); // Enable layouts
app.set('layout', 'layouts/main'); // Set default layout

// Using routes
app.use('/', AuthRouter); // authenticate the user and redirect tp route '/feed'
app.use('/feed', FeedRouter); // show all posts as feed
app.use('/search', SearchRouter); // search for users
app.use('/in', ProfileRouter); // redirect route '/in/:user_id'
app.use('/mynetwork', MyNetwork);  
app.use('/jobs', JobsRouter)  
app.use('/messaging', MessaginRouter)  // Handles all messaging routes including conversations
app.use('/notifications', NotificationsRouter)  
app.use('/feedback', FeedbackRouter); // lawyer feedback system
app.use('/seed', storeRouter); 

// { force: true }
sequelize.sync( { force: false })
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to sync database:', err);
    });