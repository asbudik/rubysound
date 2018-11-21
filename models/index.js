var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var _ = require('lodash');

var DEFAULT_NODE_ENV = 'development';

var env = process.env.NODE_ENV || DEFAULT_NODE_ENV;

var config = require(__dirname + '/../config/config.json')[env];

var sequelize = new Sequelize(
  process.env.DATABASE_URL || config.database,
  process.env.DATABASE_USER || config.username,
  process.env.DATABASE_PASSWORD || config.password,
  config
);

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
