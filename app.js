const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const { sequelize } = require('./models');
//routes
const BlogRouter = require('./routes/blog'); 
const UserRouter = require('./routes/User')


const methodOverride = require('method-override');
const app = express();
require('dotenv').config();



// Middlewares:
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(methodOverride('_method'));
app.use(methodOverride('_method', { methods: ['POST', 'GET'] }));
app.use(express.static(path.join(__dirname, 'public')));
// app.use(cors());


//view engine
app.set('view engine', 'ejs');
app.set('views', 'views');


app.use('/blog',BlogRouter);
app.use('/users',UserRouter);

app.get('/', (req,res)=>{
    res.send("main route working in app.js file!")
})

const PORT = process.env.PORT || 3000;
//{ force: true }
sequelize.sync({ force: true })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to sync database:', err);
    });