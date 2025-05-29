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
        allowNull: true
    },
    badgeNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    badgeIssueDate: {
        type: DataTypes.DATE,
        allowNull: false
    },
    badgeIssuingAuthority: {
        type: DataTypes.ENUM('training', 'approved', 'consultant'),
        allowNull: false
    },
    summary:{
        type: DataTypes.TEXT,
        allowNull:true,
    },
    legalAreas: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    verificationStatus: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
        allowNull: false
    },
    verificationDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    verifiedBy: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true
    }
},{
        underscored: true,
        timestamps: false
});

module.exports = Lawyer;