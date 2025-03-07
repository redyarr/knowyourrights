const {sequelize, DataTypes} = require('../util/db');

const Connection = sequelize.define('connections', {
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
        type: DataTypes.STRING, 
        allowNull: false,
    },
}, {
    timestamps: true,
});

module.exports = Connection;
