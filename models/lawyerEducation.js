const {sequelize, DataTypes} = require('../util/db');

const LawyerEducation = sequelize.define('lawyer_educations', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  lawyerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  educationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  timestamps: false,
  underscored:true
});

module.exports = LawyerEducation;