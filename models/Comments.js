const Sequelize = require('sequelize');
const db = require('../util/db');

    const Comments = db.define('Comments', {
    
        comment_id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        post_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'Blogs',
                key: 'post_id'
            }
        },
        user_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'users',
                key: 'user_id'
            }
        },
        content: {
            type: Sequelize.TEXT,
            allowNull: false
        }
    });
 
;


module.exports = Comments;