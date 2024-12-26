const Sequelize = require('sequelize');
const db = require('../util/db');

const Categories = db.define('categories', {

    category_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: true
    }
});

module.exports = Categories;

