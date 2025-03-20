const {sequelize, DataTypes} = require('../util/db');

const Comment = sequelize.define('comments', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    postId: {
        type: DataTypes.INTEGER,
    },
    userId: {
        type: DataTypes.INTEGER,
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
    },
}, {
    timestamps: false,
    underscored: true
});

module.exports = Comment;