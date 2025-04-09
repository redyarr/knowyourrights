
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();
// const DB_password = process.env.DB_PASSWORD

const sequelize = new Sequelize(
  process.env.DB_NAME || "knowyourrights",    // Database name
  process.env.DB_USER || "root",    // Username
process.env.DB_PASSWORD || "(Aland&DB)", // Password
  {
    host: process.env.DB_HOST || 'localhost', // Hostname
    dialect: 'mysql',
    dialectOptions: {
      // Depending on InfinityFree, SSL may not be required:
      // ssl: { require: true, rejectUnauthorized: false }
    }
  }
);

module.exports = sequelize;


sequelize.authenticate()
  .then(() => {
    console.log('Connection to knowyourrights database has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = { sequelize, DataTypes};
