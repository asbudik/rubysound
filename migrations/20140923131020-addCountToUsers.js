var Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
      username: {
        type: Sequelize.STRING,
          unique: true,
          allowNull: false,
        },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      contributions: {
        type: Sequelize.INTEGER
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return migration.dropTable('Users');
  }
};
