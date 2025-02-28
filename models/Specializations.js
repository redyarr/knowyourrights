const Sequelize = require('sequelize');
const db = require('../util/db');
const Lawyers = require('./Lawyers'); // Ensure Lawyers model is imported

const Specialization = db.define('Specialization', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    lawyerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: Lawyers,
            key: 'id'
        }
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: true
    }
}, {
    timestamps: true // Add timestamps
});

module.exports = Specialization;
