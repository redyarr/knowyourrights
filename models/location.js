const {sequelize, DataTypes} = require('../util/db');

const Location = sequelize.define('locations', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    country: { 
        type: DataTypes.STRING, 
        allowNull: false,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: false,
    underscored: true
})

module.exports = Location