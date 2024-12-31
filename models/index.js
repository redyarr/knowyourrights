const sequelize = require('../util/db');
console.log("====================================");
console.log("here is model/index.js");

// Import models
const Users = require('../models/users');
const Appointmnts = require('../models/appointments');
const Blogs = require('../models/blogs');
const Comments = require('../models/Comments');
const Categories = require('../models/Categories');
const Lawyers = require('./lawyers');
const Reacts = require('../models/reacts')
console.log("models imported");

// Define associations
Users.hasOne(Lawyers, { foreignKey: 'user_id' });
Lawyers.belongsTo(Users, { foreignKey: 'user_id' });

Users.hasMany(Blogs, { foreignKey: 'author_id' });
Blogs.belongsTo(Users, { foreignKey: 'author_id' });

Categories.hasMany(Blogs, { foreignKey: 'category_id' });
Blogs.belongsTo(Categories, { foreignKey: 'category_id' });

Users.hasMany(Reacts, { foreignKey: 'user_id' });
Reacts.belongsTo(Users, { foreignKey: 'user_id' });

Blogs.hasMany(Reacts, { foreignKey: 'blog_id' });
Reacts.belongsTo(Blogs, { foreignKey: 'blog_id' });

module.exports = {
    sequelize,
    Users,
    Appointmnts,
    Blogs,
    Comments,
    Categories,
    Lawyers,
    Reacts
}
console.log("exported");
