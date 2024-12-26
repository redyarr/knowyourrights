const Sequelize = require('sequelize');
const db = require('../util/db');

const Appointments = db.define('appointments', {
    appointment_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    lawyer_id: {
        type: Sequelize.INTEGER,
        references: {
            model: 'lawyers',
            key: 'lawyer_id'
        }
    },
    user_id: {
        type: Sequelize.INTEGER,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    appointment_date: {
        type: Sequelize.DATE,
        allowNull: false
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "pending"
    }
});

module.exports = Appointments;
