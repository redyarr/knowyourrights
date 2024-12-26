module.exports = (sequelize, DataTypes) => {
    const Comments = sequelize.define('Comments', {
    
        comment_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },

        post_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Blogs',
                key: 'post_id'
            }
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'Users',
                key: 'user_id'
            }
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        }
    });
    return Comments;
};
