function Venue(sequelize, DataTypes){
  /* sequelize.define(modelName, attributes, options); */

  var Venue = sequelize.define('venue', {
    venuename: DataTypes.STRING,
    venuedate: DataTypes.STRING
  },
    {
      classMethods: {
        associate: function(db) {
          Venue.belongsTo(db.song);
        }
      }
    });
  return Venue;
};



module.exports = Venue;