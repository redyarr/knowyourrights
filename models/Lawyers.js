const Sequelize = require('sequelize');
const db = require('../util/db');

const Lawyers = db.define('lawyers', {
    lawyer_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: Sequelize.INTEGER,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    law_firm: {
        type: Sequelize.STRING,
        allowNull: false
    },
    specialization: {
        type: Sequelize.STRING,
        allowNull: false
    },
    license_number: {
        type: Sequelize.STRING,
        allowNull: false
    },
    contact_number: {
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

