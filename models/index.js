const sequelize = require('../util/db');
// const db = require('../util/db');
console.log("====================================");
console.log("here is model/index.js");

// Import models
const Users = require('../models/users');
const appointmnts = require('../models/appointments');
const blogs = require('../models/blogs');
const comments = require('../models/Comments');
const categories = require('../models/Categories');
const lawyers = require('../models/Lawyers');
console.log("models imported");

module.exports = {
    sequelize,
    Users,
    appointmnts,
    blogs,
    comments,
    categories,
    lawyers
}
console.log("exported");
