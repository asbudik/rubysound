var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var _ = require('lodash');

var DEFAULT_NODE_ENV = 'development';
var PRODUCTION_NODE_ENV = 'production';

var env = process.env.NODE_ENV || DEFAULT_NODE_ENV;

var config = require(__dirname + '/../config/config.json')[env];

// initialize postgres connection pool and connect to postgres

var sequelize;
var sequelizeDefaultOptions = {
  dialect: 'postgres'
};
if (env == PRODUCTION_NODE_ENV) {
  sequelize = new Sequelize(
    process.env.DATABASE_URL,
    null,
    null,
    sequelizeDefaultOptions
  );

} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    sequelizeDefaultOptions
  );
}

sequelize
  .authenticate()
  .then(() => {
    console.log('Connected successfully to database!');
  })
  .catch(err => {
    console.error('Unable to connect to database:', err);
  });

var db = {};

fs
  .readdirSync(__dirname)
  .filter(function findModelFiles(file) {
    return (file.indexOf('.') !== 0) && (file !== 'index.js');
  })
  .forEach(function importModel(file) {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ('associate' in db[modelName]) {
    db[modelName].associate(db);
  }
});

module.exports = _.extend({
  sequelize: sequelize,
  Sequelize: Sequelize
}, db);
