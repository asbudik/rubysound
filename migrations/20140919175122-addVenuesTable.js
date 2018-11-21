var Sequelize = require('sequelize');

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Venues', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
      venuename: {
        type: Sequelize.STRING,
        allowNull: false
      },
      venuedate: {
        type: Sequelize.STRING,
        allowNull: false
      },
      songId: {
        type: Sequelize.INTEGER,
        foreignKey: true
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Venues');
  }
};
