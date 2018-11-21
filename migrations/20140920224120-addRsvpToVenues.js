var Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Venues',
      'rsvp',
      Sequelize.STRING
    );
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.removeColumn(
        'Venues',
        'rsvp'
      );
  }
};
