(function() {
  var SoundsApp;

  SoundsApp = angular.module("SoundsApp", ["ngRoute", "SoundsControllers", "SoundsFactories"]);

  SoundsApp.config([
    "$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
      $routeProvider.when('/', {
        templateUrl: "templates/index.html",
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
      console.log(this);
    }

    SoundsCtrl.prototype.searchSongs = function(query) {
      var thisQuery;
      this.greeting = "you";
      thisQuery = query;
      this.scope.query = {};
      console.log(query.string);
      return this.http.post('api/searchsongs', {
        query: query.string
      }).success((function(_this) {
        return function(data) {
          console.log(data);
          return _this.tracks = data;
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
