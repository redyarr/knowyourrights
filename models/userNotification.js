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
}, {
    underscored:true,
    timestamps: false,
});


module.exports = UserNotification;