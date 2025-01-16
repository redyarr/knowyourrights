const Sequelize = require('sequelize');
const db = require('../util/db');
const { name } = require('ejs');

const Lawyers = db.define('lawyers', {
    lawyer_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },

    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
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

