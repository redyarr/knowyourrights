const {sequelize, DataTypes} = require('../util/db');

const ProfileImage = sequelize.define('profile_images', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: { 
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    imagePath: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: false,
    underscored: true
})

module.exports = ProfileImage
