const {sequelize, DataTypes} = require('../util/db');

const PostImage = sequelize.define('post_images', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    postId: { 
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    imagePath: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: false,
    underscored: true
})

module.exports = PostImage
