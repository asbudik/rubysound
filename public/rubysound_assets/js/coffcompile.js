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
    function SoundsCtrl(scope, http, Sound) {
      this.scope = scope;
      this.http = http;
      this.Sound = Sound;
      this.greeting = "hello worldsss";
      this.tracks = [];
    }

    SoundsCtrl.prototype.searchSongs = function(query) {
      var thisQuery;
      thisQuery = query;
      this.scope.query = {};
      return this.http.post('api/searchsongs', {
        query: query.string
      }).success((function(_this) {
        return function(data) {
          _this.scope.clicked = false;
          console.log(data);
          _this.tracks = data.tracks.items;
          return _this.artists = data.artists;
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

    return SoundsCtrl;

  })();

  SoundsControllers.controller("SoundsCtrl", ["$scope", "$http", "Sound", SoundsCtrl]);

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
