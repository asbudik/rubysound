(function() {
  var SoundsApp;

  SoundsApp = angular.module("SoundsApp", ["ngRoute", "SoundsControllers", "SoundsFactories", "plangular"]);

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
      this.user = "";
      this.tracks = {};
      this.songs = [];
      this.http.get('api/users').success((function(_this) {
        return function(data) {
          _this.users = data;
          if (data.session) {
            _this.user = data.session;
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
          _this.tracks.soundcloud = data;
          return _this.http.post('api/spotify', {
            query: query.string
          }).success(function(data) {
            _this.tracks.spotify = data;
            return _this.scope.clicked = false;
          });
        };
      })(this));
    };

    SoundsCtrl.prototype.searchLiveBands = function(track) {
      this.scope.clicked = true;
      this.newSong = {};
      return this.http.post("api/users/" + this.user.id + "/songs", {
        title: track.name,
        artist: track.artists[0].name,
        image: track.album.images[2].url,
        playthrough: false
      }).success((function(_this) {
        return function(data) {
          console.log(data);
          _this.songs.push(data);
          _this.newSong = data.song.id;
          return _this.http.post('api/searchlivebands', {
            track: track.artists[0].name
          }).success(function(data) {
            var listing, _i, _len, _results;
            _results = [];
            for (_i = 0, _len = data.length; _i < _len; _i++) {
              listing = data[_i];
              _results.push(_this.http.post("api/songs/" + _this.newSong + "/venues", {
                venuename: listing.formatted_location + " AT " + listing.venue.name,
                venuedate: listing.formatted_datetime,
                rsvp: listing.facebook_rsvp_url
              }));
            }
            return _results;
          });
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
