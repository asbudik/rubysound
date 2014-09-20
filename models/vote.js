function Vote(sequelize, DataTypes){
  /* sequelize.define(modelName, attributes, options); */

  var Vote = sequelize.define('vote', {
    count: DataTypes.INTEGER,
    uservote: DataTypes.INTEGER
  },
    {
      classMethods: {
        associate: function(db) {
          Vote.belongsTo(db.song);
        }
      }
    });
  return Vote;
};



module.exports = Vote;