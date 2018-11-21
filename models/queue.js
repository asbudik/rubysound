var Sequelize = require('sequelize');

function Queue(sequelize, Sequelize) {
  var Queue = sequelize.define('Queue', {
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    artist: {
      type: Sequelize.STRING,
      allowNull: false
    },
    image: Sequelize.STRING,
    playthrough: Sequelize.BOOLEAN,
    url: {
      type: Sequelize.STRING,
      allowNull: false
    },
    duration: {
      type: Sequelize.INTEGER
    }
  }, {
    classMethods: {
      associate: function(db) {
        Queue.hasMany(db.vote);
        Queue.hasMany(db.venue);
      }
    }
  });

  return Queue;
};

module.exports = Queue;
