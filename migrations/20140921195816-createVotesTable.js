var Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Votes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
      count: {
        type: Sequelize.INTEGER,
        defaultValue: 10
      },
      uservote: {
        type: Sequelize.INTEGER
      },
      queueId: {
        type: Sequelize.INTEGER,
        foreignKey: true
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Votes');
  }
};
