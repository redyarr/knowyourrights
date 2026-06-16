const { sequelize, DataTypes } = require('../util/db');

const JobApply = sequelize.define('job_applier', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id'
    },
    jobId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'job_id'
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
        defaultValue: 'pending',
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'created_at'
    }
}, {
    timestamps: false,
    underscored: true
});

module.exports = JobApply;
