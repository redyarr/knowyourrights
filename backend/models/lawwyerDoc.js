const {sequelize, DataTypes} = require('../util/db');

const lawyerDoc = sequelize.define('lawyer_docs', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    lawyerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    idPath: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

module.exports = lawyerDoc;