const sequelize = require('../util/db');
console.log("====================================");
console.log("Initializing models...");

// Import models
const Users = require('./users');
const Appointments = require('./Appointments');
const Blogs = require('./Blogs');
const Comments = require('./comments');
const Categories = require('./Categories');
const Lawyers = require('./Lawyers');
const Reacts = require('./Reacts');
const Contacts = require('./Contacts');
const Connections = require('./Connections');
const Messages = require('./Messages')
const Notifications = require('./Notifications')
const Specializations = require('./Specializations');

console.log("Models imported successfully");

// Define associations
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

// Fix duplicate alias issue
Users.hasMany(Connections, { foreignKey: 'requesterId', as: 'SentConnections' });
Users.hasMany(Connections, { foreignKey: 'receiverId', as: 'ReceivedConnections' });
Connections.belongsTo(Users, { foreignKey: 'requesterId', as: 'Requester' });
Connections.belongsTo(Users, { foreignKey: 'receiverId', as: 'Receiver' });

Users.hasMany(Messages, { foreignKey: 'senderId', as: 'SentMessages' });
Users.hasMany(Messages, { foreignKey: 'receiverId', as: 'ReceivedMessages' });
Messages.belongsTo(Users, { foreignKey: 'senderId', as: 'Sender' });
Messages.belongsTo(Users, { foreignKey: 'receiverId', as: 'Receiver' });

Users.hasMany(Notifications, { foreignKey: 'userId', as: 'notifications' });
Notifications.belongsTo(Users, { foreignKey: 'userId', as: 'user' });



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
    Contacts,
    Connections,
    Notifications
};

console.log("Models exported");
