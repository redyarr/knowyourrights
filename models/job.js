const { sequelize, DataTypes } = require('../util/db');

const Job = sequelize.define('jobs', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    authorId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    summary: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    country:{
        type: DataTypes.STRING,
        allowNull: false
    },
    city:{
        type: DataTypes.STRING,
        allowNull: false
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: false,
    underscored: true
})

module.exports = Job;