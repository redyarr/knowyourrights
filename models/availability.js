const { DataTypes } = require('sequelize');
const { sequelize } = require('../util/db');

const Availability = sequelize.define('availabilities', {
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
    day_of_week: {
        type: DataTypes.ENUM('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
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
    is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    consultation_duration: {
        type: DataTypes.INTEGER, // Duration in minutes
        allowNull: false,
        defaultValue: 60
    },
    break_between_appointments: {
        type: DataTypes.INTEGER, // Break time in minutes
        allowNull: false,
        defaultValue: 15
    },
    timezone: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'UTC'
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

// Model for specific date overrides (holidays, special availability)
const AvailabilityOverride = sequelize.define('availability_overrides', {
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
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: true // null means unavailable for the entire day
    },
    end_time: {
        type: DataTypes.TIME,
        allowNull: true
    },
    is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: false // Default to unavailable (holiday/vacation)
    },
    reason: {
        type: DataTypes.STRING,
        allowNull: true // e.g., "Holiday", "Vacation", "Court Appearance"
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

module.exports = { Availability, AvailabilityOverride };