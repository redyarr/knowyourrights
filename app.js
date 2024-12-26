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



db.sync().then(() => {
app.listen(PORT)

}).catch(err => {
    console.error(err); 
}
)