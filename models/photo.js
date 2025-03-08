const {sequelize, DataTypes} = require('../util/db');

const PostPhoto = sequelize.define('photos', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    photoPath: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    timestamps: false,
    underscored: true
})

module.exports = PostPhoto
