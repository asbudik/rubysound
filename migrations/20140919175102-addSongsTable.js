module.exports = {
  up: function(migration, DataTypes, done) {
    // add altering commands here, calling 'done' when finished
    migration.createTable('songs',
      {id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      artist: {
        type: DataTypes.STRING,
        allowNull: false
      },
      image: {
        type: DataTypes.STRING
      },
      playthrough: {
        type: DataTypes.BOOLEAN
      },
      userId: {
        type: DataTypes.INTEGER,
        foreignKey: true
      }
    })
    .complete(done);
  },
  down: function(migration, DataTypes, done) {
    // add reverting commands here, calling 'done' when finished

    migration.dropTable('songs')
      .complete(done);
  }
};
