const { sequelize } = require('../util/db');
console.log("====================================");
console.log("Initializing models...");

// Import models
const Users = require('./user');
const Posts = require('./Post');
const Lawyers = require('./lawyer');
const Comments = require('./comment');
const Categories = require('./category');
const Reacts = require('./react');
const Contacts = require('./contact');
const Connections = require('./connection');
const Messages = require('./message');
const Notifications = require('./notification');
const Shares = require('./share');
const PostImages = require('./postImage');
const PostCategories = require('./postCategory')

console.log("Models imported successfully");

// Define associations
try {
    Users.hasOne(Lawyers, { foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    Lawyers.belongsTo(Users, { foreignKey: 'user_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

    Users.hasMany(Posts, { foreignKey: 'author_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });
    Posts.belongsTo(Users, { foreignKey: 'author_id', onDelete: 'CASCADE', onUpdate: 'CASCADE' });

    Lawyers.hasMany(Contacts, { foreignKey: 'lawyerId' });
    Contacts.belongsTo(Lawyers, { foreignKey: 'lawyerId' });

    Users.hasMany(Reacts, { foreignKey: 'user_id' });
    Reacts.belongsTo(Users, { foreignKey: 'user_id' });

    Posts.hasMany(Reacts, { foreignKey: 'post_id' });
    Reacts.belongsTo(Posts, { foreignKey: 'post_id' });

    Users.hasMany(Connections, { foreignKey: 'requester_id' });
    Users.hasMany(Connections, { foreignKey: 'receive_id' });
    Connections.belongsTo(Users, { foreignKey: 'requester_id' });
    Connections.belongsTo(Users, { foreignKey: 'receive_id' });

    Users.hasMany(Messages, { foreignKey: 'sender_id' });
    Users.hasMany(Messages, { foreignKey: 'receive_id' });
    Messages.belongsTo(Users, { foreignKey: 'sender_id' });
    Messages.belongsTo(Users, { foreignKey: 'receive_id' });

    Users.hasMany(Notifications, { foreignKey: 'user_id' });
    Notifications.belongsTo(Users, { foreignKey: 'user_id' });

    Users.hasMany(Shares, { foreignKey: 'user_id' });
    Shares.belongsTo(Users, { foreignKey: 'user_id' });
    
    Categories.hasMany(Posts, { foreignKey: 'category_id' });
    Posts.belongsTo(Categories, { foreignKey: 'category_id' });

    Posts.hasMany(Shares, { foreignKey: 'post_id' });
    Shares.belongsTo(Posts, { foreignKey: 'post_id' });

    Posts.hasMany(Comments, { foreignKey: 'post_id' });
    Comments.belongsTo(Posts, { foreignKey: 'post_id' });
    
    Posts.hasMany(PostImages, { foreignKey: 'post_id' });
    PostImages.belongsTo(Posts, { foreignKey: 'post_id' });
    
    Users.hasMany(Comments, { foreignKey: 'user_id' });
    Comments.belongsTo(Users, { foreignKey: 'user_id' });

    Posts.belongsToMany(Categories, { through: PostCategories, foreignKey: 'postId' });
    Categories.belongsToMany(Posts, { through: PostCategories, foreignKey: 'category_id' });

    console.log("Associations defined successfully");
} catch (error) {
    console.error("Error defining associations:", error);
}

module.exports = {
    sequelize,
    Users,
    Posts,
    Comments,
    Categories,
    Lawyers,
    Reacts,
    Contacts,
    Connections,
    Notifications,
    Shares,
    PostImages
};

console.log("Models exported");