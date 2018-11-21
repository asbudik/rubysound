var Sequelize = require('sequelize');

function Vote(sequelize, Sequelize) {
  var Vote = sequelize.define('Vote', {
    count: Sequelize.INTEGER,
    uservote: Sequelize.INTEGER
  }, {
    classMethods: {
      associate: function(db) {
        Vote.belongsTo(db.song);
      }
    }
  });

  return Vote;
};

module.exports = Vote;
