
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('knowyourrights', 'root', '(Aland&DB)', {
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

