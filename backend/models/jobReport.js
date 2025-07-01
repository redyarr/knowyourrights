const {sequelize, DataTypes} = require('../util/db');
// const { Users, Posts } = require('../models'); 

const JobReport = sequelize.define('job_reports', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    jobId: { 
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    RoportType: { 
        type: DataTypes.ENUM('SPAM', 'ABUSE', 'OTHER'), 
        allowNull: false, 
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
},{
        timestamps: false,
        underscored: true,
});

module.exports = JobReport;
