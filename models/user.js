var bcrypt = require("bcrypt");
var salt = bcrypt.genSaltSync(Number(process.env.SOUNDSALT));
var passport = require("passport");
var passportLocal = require("passport-local");

module.exports = function (sequelize, DataTypes) {
  var User = sequelize.define('user', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [6, 20]
      }
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: true,
        len: [6, 20]
      }
    }
  },

  {
    classMethods: {
      associate: function(db) {
        User.hasMany(db.song);
      },
      encryptPass: function(password) {
        var hash = bcrypt.hashSync(password, salt);
      },
      comparePass: function(userpass, dbpass) {
        return bcrypt.compareSync(userpass, dbpass);
      },
      createNewUser: function(username, password, confirmation, err, success) {
        if (password.length < 6) {
          err({message: "password should be more than six characters"})
        } else if (password !== confirmation) {
          err({message: "passwords do not match, please try again"})
        } else {
          User.create({
            username: username,
            password: User.encryptPass(password)
          }).error(function(error) {
            if(error.username) {
              err({message: 'Your username should be at least six characters'})
            } else {
              err({message: 'An account with that username already exists'})
            }
          }).success(function(user) {
            success({message: 'Welcome to the community!'})
          });
          }
        },
      }
    }
  );

  passport.use(new passportLocal.Strategy({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true
    },
    function(req, username, password, done) {
      User.find({
        where: {
          username: username
        }
      })
    .done(function(error, user) {
      if(error) {
        console.log(error)
        return done(err, req.flash('loginMessage', 'Ooops! Something went wrong'))
      }
      if (user === null) {
        return done(null, false, req.flash('loginMessage', 'Username does not exist'))
      }
      if ((User.comparePass(password, user.password)) !== true) {
        return done(null, false, req.flash('loginMessage', 'Invalid password'))
      }
      done(null, user)
    });
  }));
  return User;
};