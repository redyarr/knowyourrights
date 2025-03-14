const { sequelize, DataTypes } = require('../util/db');

const UserNotification = sequelize.define('user_notifications', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    notificationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
  },
}, {
    underscored:true,
    timestamps: false,
});


module.exports = UserNotification;