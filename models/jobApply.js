const {sequelize, DataTypes} = require('../util/db');
// const { Users, Posts } = require('../models'); 

const JobApply = sequelize.define('job_applier', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    postId: { 
        type: DataTypes.INTEGER,
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

module.exports = JobApply;
