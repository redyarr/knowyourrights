const {sequelize, DataTypes} = require('../util/db');

const PostPhoto = sequelize.define('post_photos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    postId: { 
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    photoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    timestamps: false,
    underscored: true
})

module.exports = PostPhoto
