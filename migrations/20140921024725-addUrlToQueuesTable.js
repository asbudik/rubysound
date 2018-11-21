var Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface, Sequelize) => {
    // add altering commands here, calling 'done' when finished
    return queryInterface.addColumn(
      'Queues',
      'url',
      Sequelize.STRING
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Queues',
      'url',
      Sequelize.STRING
    );
  }
};
