const { sequelize, DataTypes } = require('../util/db');

const Location = sequelize.define('locations', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
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
    underscored: true,
    indexes: [
        {
            name: 'unique_country_city', 
            unique: true,
            fields: ['country', 'city']
        }
    ]
});

module.exports = Location;
