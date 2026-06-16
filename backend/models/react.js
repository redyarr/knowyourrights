const {sequelize, DataTypes} = require('../util/db');
// const { Users, Posts } = require('../models'); 

const React = sequelize.define('reacts', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    postId: { 
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    reaction: { 
        type: DataTypes.ENUM('like', 'love', 'haha', 'wow', 'sad', 'angry'), 
        allowNull: false, 
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
},{
        timestamps: false,
        underscored: true,
});

module.exports = React;
