var bcrypt = require('bcrypt');
var salt = bcrypt.genSaltSync(Number(process.env.SOUNDSALT));

var passport = require('passport');
var passportLocal = require('passport-local');

var Sequelize = require('sequelize');

module.exports = function (sequelize, Sequelize) {

  var User = sequelize.define('User', {
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: [6, 20]
      }
    },
    password: {
      type: Sequelize.STRING,
      validate: {
        notEmpty: true
      }
    },
    contributions: {
      type: Sequelize.INTEGER
    },
    image: {
      type: Sequelize.STRING
    }
  }, {
    classMethods: {
      associate: function(db) {
        User.hasMany(db.song);
      },
      encryptPass: function(password) {
        var hash = bcrypt.hashSync(password, salt);
        return hash
      },
      comparePass: function(userpass, dbpass) {
        return bcrypt.compareSync(userpass, dbpass);
      },
      // TODO: return to this later
      createNewUser: function(params, err, success) {
        existinguser = User.find({where: {username: params.username}})
        if (params.password.length < 6) {
          err({message: "password should be more than six characters"})
        } else if (params.password !== params.confirmation) {
          err({message: "passwords do not match, please try again"})
        } else if (params.username.length < 6) {
          err({message: "username should be more than six characters"})
        } else {
          User.create({
            username: params.username,
            password: User.encryptPass(params.password),
            contributions: params.contributions,
            image: params.image
          }).error(function(error) {
            err({message: "An account with that username already exists"})
          }).success(function(user) {
            success({message: 'Welcome to the community!', user: user})
          });
          }
        }
      }
    }
  );

  passport.use(new passportLocal.Strategy({
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true
    },
    (req, username, password, done) => {
      User.findOne({
        where: { username: username }
      }).then(user => {
        if (user === null) {
          return done(
            null,
            false,
            req.flash('loginMessage', 'Username does not exist')
          );
        }

        // NOTE: don't store passwords in plaintext to db - correct this later
        if (password !== user.password) {
          return done(
            null,
            false,
            req.flash('loginMessage', 'Invalid password')
          );
        }
        done(null, user);

      }).catch(err => {
        console.log('error finding user: ' + err);
        return done(
          err,
          req.flash('loginMessage', 'Ooops! Something went wrong')
        );
      });
    }
  ));

  return User;
};
