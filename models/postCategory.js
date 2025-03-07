const {sequelize, DataTypes} = require('../util/db');

const PostCategory = sequelize.define('post_categories', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    postId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    underscored: true,
    timestamps: false
});

module.exports = PostCategory;