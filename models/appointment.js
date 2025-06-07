const { DataTypes } = require('sequelize');
const { sequelize } = require('../util/db');

const Appointment = sequelize.define('appointments', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    lawyer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    client_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    appointment_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    end_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    duration: {
        type: DataTypes.INTEGER, // Duration in minutes
        allowNull: false,
        defaultValue: 60
    },
    consultation_type: {
        type: DataTypes.ENUM('initial_consultation', 'follow_up', 'legal_advice', 'document_review', 'court_preparation'),
        allowNull: false,
        defaultValue: 'initial_consultation'
    },
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled', 'rescheduled'),
        allowNull: false,
        defaultValue: 'pending'
    },
    meeting_type: {
        type: DataTypes.ENUM('in_person', 'video_call', 'phone_call'),
        allowNull: false,
        defaultValue: 'video_call'
    },
    meeting_link: {
        type: DataTypes.STRING,
        allowNull: true // For video call links
    },
    location: {
        type: DataTypes.TEXT,
        allowNull: true // For in-person meetings
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    client_notes: {
        type: DataTypes.TEXT,
        allowNull: true // Notes from client about the consultation
    },
    fee: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    payment_status: {
        type: DataTypes.ENUM('pending', 'paid', 'refunded', 'free'),
        allowNull: false,
        defaultValue: 'pending'
    },
    reminder_sent: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
});

module.exports = Appointment;