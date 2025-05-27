const {sequelize, DataTypes} = require('../util/db');

const Lawyer = sequelize.define('lawyers', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    lawFirm: {
        type: DataTypes.STRING,
        allowNull: false
    },
    licenseNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    summary:{
        type: DataTypes.TEXT,
        allowNull:true,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    badgeId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    badgeIssueDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    badgeExpiryDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    badgeImagePath: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'declined'),
        defaultValue: 'pending'
    },
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    submissionTimestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    approvalTimestamp: {
        type: DataTypes.DATE,
        allowNull: true
    },
    declineTimestamp: {
        type: DataTypes.DATE,
        allowNull: true
    },
    university: {
        type: DataTypes.STRING,
        allowNull: false
    },
    degreeLevel: {
        type: DataTypes.ENUM('LLB', 'LLM', 'JD', 'PhD in Law'),
        allowNull: false
    },
    authority: {
        type: DataTypes.ENUM('Training', 'Working', 'Legal Consultant'),
        allowNull: false
    }
},
        {
        underscored: true,
        timestamps: false
});

module.exports = Lawyer;