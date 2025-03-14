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
    authority: {
        type: DataTypes.ENUM('training', 'approved', 'consultant')
    }
},{
        underscored: true,
        timestamps: false
});

module.exports = Lawyer;