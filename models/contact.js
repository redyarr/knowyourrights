const { sequelize, DataTypes } = require('../util/db');

const Contact = sequelize.define('contacts', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    number: { 
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            notEmpty: true,
            isNumeric: { msg: "Must be a number" }
        },
        unique: true
    }
}, {
    timestamps: false,
    underscored: true
});

module.exports = Contact;