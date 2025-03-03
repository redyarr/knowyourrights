const Sequelize = require('sequelize');
const db = require('../util/db');
const Lawyers = require('./Lawyers'); // Ensure Lawyers model is imported
const Users = require('./users'); // Ensure Users model is imported

const Appointments = db.define('Appointments', {
    appointment_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    lawyer_id: {
        type: Sequelize.INTEGER,
        references: {
            model: Lawyers,
            key: 'id'
        }
    },
    user_id: {
        type: Sequelize.INTEGER,
        references: {
            model: Users,
            key: 'id'
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
