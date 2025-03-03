const Sequelize = require('sequelize');
const db = require('../util/db');
const Users = require('./users'); 
const Blogs = require('./Blogs')

    const Comments = db.define('Comments', {
    
        comment_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        post_id: {
            type: Sequelize.INTEGER,
            references: {
                model: Blogs,
                key: 'post_id'
            }
        },
        user_id: {
            type: Sequelize.INTEGER,
            references: {
                model: Users,
                key: 'id'
            }
        },
        content: {
            type: Sequelize.TEXT,
            allowNull: false
        }
    });
 
;


module.exports = Comments;