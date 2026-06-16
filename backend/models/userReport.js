const {sequelize, DataTypes} = require('../util/db');

const UserReport = sequelize.define('user_reports', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: { 
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    reporterId: { 
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    reportType: {
        type: DataTypes.ENUM('SPAM', 'ABUSE', 'OTHER'),
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
}, {
    timestamps: false,
    underscored: true
})

module.exports = UserReport
