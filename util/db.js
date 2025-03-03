
const { Sequelize } = require('sequelize');
require('dotenv').config();
const DB_password = process.env.DB_PASSWORD

const sequelize = new Sequelize('knowyourrights', 'root', DB_password, {
  host: 'localhost',
  dialect: 'mysql'// or 'postgres', 'sqlite', 'mariadb', etc.
});

sequelize.authenticate()
  .then(() => {
    console.log('Connection to knowyourrights database has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;

