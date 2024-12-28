const express = require('express');
const app = express();
const env = require('env');
const PORT = process.env.PORT || 3000;

const db = require('./util/db');

//models 

const Users = require('./models/users');
const appointmnts = require('./models/appointments');
const blogs = require('./models/blogs');
const comments = require('./models/Comments');
const categories = require('./models/Categories');
const lawyers = require('./models/Lawyers');



app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));


const lawCategories = [
    'Criminal Law',
    'Family Law',
    'Personal Injury',
    'Immigration Law',
    'Real Estate Law',
    'Intellectual Property Law',
    'Employment Law',
    'Business Law',
    'Bankruptcy Law',
    'Tax Law'
]

app.get('/',()=>{
    for (const category of lawCategories) {
        const existingCategory =  categories.findOne({ where: { name: category } }).then((existingCategory)=>{
            if (!existingCategory){
                categories.create({ name: category });
            } 
             
        }).then(()=>{console.log("categories added")})
        
}}
)

db.sync().then(async () => {
   app.listen(PORT);

    }
).catch(err => {
    console.error(err);
})




