module.exports = (sequelize, DataTypes) => {
    const Blogs = sequelize.define('Blogs', {
     
        post_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Categories',
                key: 'category_id'
            }
        },
        author_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'user_id'
            }
        }
    });
    return Blogs;
};
