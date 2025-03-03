const { DataTypes } = require('sequelize');
const sequelize = require('../util/db');

const Connections = sequelize.define('Connections', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    requesterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    receiverId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING, // e.g., 'pending', 'accepted', 'rejected'
        allowNull: false,
    },
}, {
    timestamps: true,
});

module.exports = Connections;
