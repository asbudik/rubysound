function Queue(sequelize, DataTypes){
  /* sequelize.define(modelName, attributes, options); */

  var Queue = sequelize.define('queue', {
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
    },
    duration: {
      type: DataTypes.INTEGER
    }
  },
    {
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