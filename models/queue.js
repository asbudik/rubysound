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
    }
  });
  return Queue;
};



module.exports = Queue;