const sequelize = require('../util/db');
console.log("====================================");
console.log("Initializing models...");

// Import models
const Users = require('./Users');
const Appointments = require('./Appointments');
const Blogs = require('./Blogs');
const Comments = require('./comments');
const Categories = require('./Categories');
const Lawyers = require('./Lawyers');
const Reacts = require('./Reacts');
const Contacts = require('./Contacts');
const Specializations = require('./Specializations')

console.log("Models imported successfully");

Users.hasOne(Lawyers, { foreignKey: 'userId', as: 'lawyerProfile' });
Lawyers.belongsTo(Users, { foreignKey: 'userId', as: 'user' });

Lawyers.hasMany(Specializations, { foreignKey: 'lawyerId', as: 'specializations' });
Specializations.belongsTo(Lawyers, { foreignKey: 'lawyerId', as: 'lawyer' });

Lawyers.hasMany(Contacts, { foreignKey: 'lawyerId', as: 'contacts' });
Contacts.belongsTo(Lawyers, { foreignKey: 'lawyerId', as: 'lawyer' });

Users.hasMany(Blogs, { foreignKey: 'author_id' });
Blogs.belongsTo(Users, { foreignKey: 'author_id' });

Categories.hasMany(Blogs, { foreignKey: 'category_id' });
Blogs.belongsTo(Categories, { foreignKey: 'category_id' });

Users.hasMany(Reacts, { foreignKey: 'user_id' });
Reacts.belongsTo(Users, { foreignKey: 'user_id' });

Blogs.hasMany(Reacts, { foreignKey: 'blog_id' });
Reacts.belongsTo(Blogs, { foreignKey: 'blog_id' });

console.log("Associations defined");

module.exports = {
    sequelize,
    Users,
    Appointments,
    Blogs,
    Comments,
    Categories,
    Lawyers,
    Reacts,
    Specializations,
    Contacts
};

console.log("Models exported");
