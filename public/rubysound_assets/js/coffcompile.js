(function() {
  var SoundsApp;

  SoundsApp = angular.module("SoundsApp", ["ngRoute", "SoundsControllers", "SoundsFactories"]);

  SoundsApp.config([
    "$routeProvider", "$locationProvider", function($routeProvider, $locationProvider) {
      $routeProvider.when('/', {
        templateUrl: "templates/index.html",
        controller: "SoundsCtrl"
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
    function SoundsCtrl(scope, http) {
      this.scope = scope;
      this.http = http;
      this.greeting = "hello world";
    }

    return SoundsCtrl;

  })();

  SoundsControllers.controller("SoundsCtrl", ["$scope", "$http", SoundsCtrl]);

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
