const Sequelize = require('sequelize');
const db = require('../util/db');
const Users = require('./users'); // Import the Users model

const Lawyers = db.define('lawyers', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Users, // Reference the Users model
            key: 'id'
        }
    },
    lawFirm: {
        type: Sequelize.STRING,
        allowNull: false
    },
    licenseNumber: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    contactNumber: {
        type: Sequelize.STRING,
        allowNull: false
    },
    city: {
        type: Sequelize.STRING,
        allowNull: false
    },
    country: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

module.exports = Lawyers;