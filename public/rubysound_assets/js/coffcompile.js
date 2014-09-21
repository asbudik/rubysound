(function() {
  var SoundsApp;

  SoundsApp = angular.module("SoundsApp", ["ngRoute", "SoundsControllers", "SoundsFactories"]);

  SoundsApp.config([
    "$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
      $routeProvider.when('/', {
        templateUrl: "templates/spa.html",
        controller: "SoundsCtrl as sounds"
      }).otherwise({
        redirectTo: "/"
      });
      return $locationProvider.html5Mode(true).hashPrefix("#");
    }
  ]);

}).call(this);

(function() {
  var SoundsControllers, SoundsCtrl;

  SoundsControllers = angular.module("SoundsControllers", []);

  SoundsCtrl = (function() {
    function SoundsCtrl(scope, http, location, Sound) {
      this.scope = scope;
      this.http = http;
      this.location = location;
      this.Sound = Sound;
      this.greeting = "hello worldsss";
      this.tracks = {};
      this.http.get('api/users').success((function(_this) {
        return function(data) {
          console.log(data);
          _this.users = data;
          if (data.session) {
            _this.scope.signup = true;
            _this.scope.loginshow = false;
            _this.scope.showsearch = true;
            return _this.scope.logoutbutton = true;
          }
        };
      })(this));
    }

    SoundsCtrl.prototype.searchSongs = function(query) {
      var thisQuery;
      thisQuery = query;
      this.scope.query = {};
      return this.http.post('api/soundcloud', {
        query: query.string
      }).success((function(_this) {
        return function(data) {
          _this.scope.clicked = false;
          _this.tracks.soundcloud = data;
          return _this.http.post('api/spotify', {
            query: query.string
          }).success(function(data) {
            _this.tracks.spotify = data;
            return console.log(_this.tracks);
          });
        };
      })(this));
    };

    SoundsCtrl.prototype.searchLiveBands = function(track) {
      this.scope.clicked = true;
      return this.http.post('api/searchlivebands', {
        track: track.artists[0].name
      }).success((function(_this) {
        return function(data) {
          return console.log(data);
        };
      })(this));
    };

    SoundsCtrl.prototype.signup = function(user) {
      return this.http.post('api/users', user).success((function(_this) {
        return function(data) {
          console.log(data.user);
          if (data.user) {
            _this.scope.user = {};
            return _this.http.post('/api/login', user).success(function(data) {
              console.log(data);
              _this.scope.signup = true;
              _this.scope.loginshow = false;
              _this.scope.logoutbutton = true;
              return _this.scope.showsearch = true;
            });
          }
        };
      })(this));
    };

    SoundsCtrl.prototype.login = function(user) {
      return this.http.post('api/login', user).success((function(_this) {
        return function(data) {
          if (data.message) {
            return _this.notice = data.message;
          } else {
            _this.notice = "Welcome back!";
            _this.scope.signup = true;
            _this.scope.loginshow = false;
            _this.scope.logoutbutton = true;
            return _this.scope.showsearch = true;
          }
        };
      })(this));
    };

    SoundsCtrl.prototype.getLogin = function() {
      console.log('geti');
      this.scope.loginshow = true;
      return this.scope.signup = true;
    };

    SoundsCtrl.prototype.getSignUp = function() {
      this.scope.loginshow = false;
      return this.scope.signup = false;
    };

    return SoundsCtrl;

  })();

  SoundsControllers.controller("SoundsCtrl", ["$scope", "$http", "$location", "Sound", SoundsCtrl]);

}).call(this);

(function() {
  var Sound, SoundsFactories;

  SoundsFactories = angular.module("SoundsFactories", []);

  Sound = (function() {
    function Sound(http) {
      this.http = http;
      console.log("hello world");
    }

    return Sound;

  })();

  SoundsFactories.factory("Sound", ["$http", Sound]);

}).call(this);
