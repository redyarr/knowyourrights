const { DataTypes } = require('sequelize');
const db = require('../util/db');
const Lawyer = require('./Lawyers'); // Ensure Lawyer model is imported

const Contact = db.define('Contact', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    lawyerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Lawyer,
            key: 'id'
        }
    },
    number: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            isNumeric: true
        },
        unique: true
    }
}, {
    timestamps: true,
    underscored: true
});

module.exports = Contact;