const db = require('../util/db');
const Sequelize = require('sequelize');


const Users  = db.define('users', {
 
    user_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: Sequelize.STRING,
    email: Sequelize.STRING,
    password: Sequelize.STRING,

    role: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "visitor"
    }

});

module.exports = Users;
