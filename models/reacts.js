const Sequelize = require('sequelize');
const db = require('../util/db');
const Users = require('./users');
const Blogs = require('./blogs'); // or any other model

const Reacts = db.define('Reacts', {
    react_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: Sequelize.INTEGER,
        references: {
            model: 'users', // refers to Users model
            key: 'user_id',
        },
        allowNull: false,
    },
    blog_id: { // Or replace `blog_id` with other content IDs (post_id, comment_id, etc.)
        type: Sequelize.INTEGER,
        references: {
            model: 'blogs', // refers to Blogs model
            key: 'post_id',
        },
        allowNull: false,
    },
    reaction: { 
        type: Sequelize.STRING, 
        allowNull: false, 
        validate: {
            isIn: [['like', 'dislike', 'love', 'haha', 'sad', 'angry']] // Example reactions
        }
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
    },
    updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
    }
});

module.exports = Reacts;
