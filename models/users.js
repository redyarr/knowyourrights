const db = require('../util/db');
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');

const Users = db.define('users', {
    id: {
        type: Sequelize.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password: {
        type: Sequelize.DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: Sequelize.DataTypes.ENUM('visitor', 'lawyer', 'admin'),
        defaultValue: 'visitor'
    },
}, {
    timestamps: true,
    hooks: {
        beforeCreate: async (user) => {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
        }
    }
});

module.exports = Users;
