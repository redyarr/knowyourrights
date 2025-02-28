const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const session = require('express-session');
const { sequelize } = require('./models');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');

//routes
const UserRouter = require('./routes/User')
const BlogRouter = require('./routes/blog'); 
const LawyerRouter = require('./routes/Lawyer')

const app = express();
require('dotenv').config();
const PORT = process.env.PORT || 3000;
// Middlewares:
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(methodOverride('_method'));
app.use(methodOverride('_method', { methods: ['POST', 'GET'] }));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(cors());

const myStore = new SequelizeStore({ db: sequelize });

app.use(session({
    secret: process.env.SESSION_SECRET || "my secret",
    resave: false,
    saveUninitialized: false,
    store: myStore
}));

app.use((req, res, next) => {
    if (req.session && req.session.user_id) {
        res.locals.loggedInUserId = req.session.user_id;
    } else {
        res.locals.loggedInUserId = null;
    }
    next();
});


//view engine
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(expressLayouts); // Enable layouts
app.set('layout', 'layouts/main'); // Set default layout

// using routes:
app.use('/lawyer',LawyerRouter);
app.use('/blog',BlogRouter);
app.use('/user',UserRouter);

app.get('/', (req,res)=>{
    res.redirect('/blog');
})

app.use('/', (req, res) => {
    res.status(404).send('Page not found');
});



//    { force: true }
sequelize.sync()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to sync database:', err);
    });
