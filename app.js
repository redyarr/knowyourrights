const express = require('express');
const http = require('http')
const {Server} = require('socket.io')

const bodyParser = require('body-parser');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
require('dotenv').config();
const { sequelize } = require('./models');
const storeRouter = require('./util/store.js');


// Import routes
const UserRouter = require('./routes/User');
const BlogRouter = require('./routes/blog'); 
const LawyerRouter = require('./routes/Lawyer');


// Import session configuration
const { sessionMiddleware, setLoggedInUser } = require('./middlewares/session');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method', { methods: ['POST', 'GET'] }));
app.use(express.static(path.join(__dirname, 'public')));

// Use session middleware
app.use(sessionMiddleware);
app.use(setLoggedInUser);

// View engine
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(expressLayouts); // Enable layouts
app.set('layout', 'layouts/main'); // Set default layout

// Using routes
app.use('/lawyer', LawyerRouter);
app.use('/blog', BlogRouter);
app.use('/user', UserRouter);
app.use('/sql', storeRouter); 

// Redirect root URL to /blog
app.get('/', (req, res) => {
    res.redirect('/blog');
});

// Handle 404 errors
app.use((req, res) => {
    res.status(404).send('Page not found');
});

// { force: true }
sequelize.sync()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to sync database:', err);
    });