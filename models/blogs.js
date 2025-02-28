const Sequelize = require('sequelize');
const db = require('../util/db');
const Lawyers = require('./Lawyers'); // Ensure Lawyers model is imported
const Users = require('./users'); // Ensure Lawyers model is imported

    const Blogs = db.define('Blogs', {
        post_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        content: {
            type: Sequelize.TEXT,
            allowNull: false
        },
        category_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'Categories',
                key: 'category_id'
            }
        },
        author_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: Users,
                key: 'id'
            }
        }
    });

    module.exports = Blogs