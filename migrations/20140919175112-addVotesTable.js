module.exports = {
  up: function(migration, DataTypes, done) {
    // add altering commands here, calling 'done' when finished
    migration.createTable('votes',
      {id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
      count: {
        type: DataTypes.INTEGER,
        defaultValue: 10
      },
      uservote: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      songId: {
        type: DataTypes.INTEGER,
        foreignKey: true
      }

    })
    .complete(done);
  },
  down: function(migration, DataTypes, done) {
    // add reverting commands here, calling 'done' when finished

    migration.dropTable('votes')
      .complete(done);
  }
};
