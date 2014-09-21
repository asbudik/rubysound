function Song(sequelize, DataTypes){
  /* sequelize.define(modelName, attributes, options); */

  var Song = sequelize.define('song', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    artist: {
      type: DataTypes.STRING,
      allowNull: false
    },
    image: DataTypes.STRING,
    playthrough: DataTypes.BOOLEAN,
    url: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
    {
      classMethods: {
        associate: function(db) {
          Song.belongsTo(db.user);
          Song.hasMany(db.vote);
          Song.hasMany(db.venue);
        }
      }
    });
  return Song;
};



module.exports = Song;