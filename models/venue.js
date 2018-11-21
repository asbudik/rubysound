var Sequelize = require('sequelize');

function Venue(sequelize, Sequelize) {
  var Venue = sequelize.define('Venue', {
    venuename: Sequelize.STRING,
    venuedate: Sequelize.STRING,
    rsvp: Sequelize.STRING
  }, {
    classMethods: {
      associate: function(db) {
        Venue.belongsTo(db.song);
      }
    }
  });

  return Venue;
};

module.exports = Venue;
