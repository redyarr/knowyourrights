const Sequelize = require('sequelize');
const db = require('../util/db');
const Users = require('./users');
const Blogs = require('./Blogs');

// filepath: /C:/Users/Aland/OneDrive/Documents/GitHub/knowyourrights/models/Shares.js

const Shares = db.define('Shares', {
    share_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Users,
            key: 'id'
        }
    },
    blog_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Blogs,
            key: 'post_id'
        }
    },
    shared_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
    }
}, {
    timestamps: false
});

module.exports = Shares;