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
        type: DataTypes.STRING, 
        allowNull: false, 
        validate: {
            isIn: [['like', 'dislike', 'love', 'haha', 'sad', 'angry']] // Example reactions
        }
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
