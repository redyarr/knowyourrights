const { sequelize, DataTypes } = require('../util/db');

const Connection = sequelize.define('connections', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    requesterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
            min: 1,
        },
    },
    receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            isInt: true,
            min: 1,
        },
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'blocked'),
        allowNull: false,
    },
    createdAt:{
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    }
}, {
    indexes: [
        {
            unique: true,
            fields: ['requester_id', 'receiver_id'],
        },
    ],
    timestamps: false,
    underscored: true,
});

module.exports = Connection;
