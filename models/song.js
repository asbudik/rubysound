var Sequelize = require('sequelize');

function Song(sequelize, Sequelize){
  var Song = sequelize.define('Song', {
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
    }
  }, {
    classMethods: {
      associate: function(db) {
        Song.belongsTo(db.user);
      }
    }
  });

  return Song;
};

module.exports = Song;
