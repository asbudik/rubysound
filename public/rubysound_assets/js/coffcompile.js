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
            var count, track, _i, _len, _ref;
            _this.tracks.spotify = data;
            count = 0;
            _ref = _this.tracks.spotify.tracks.items;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              track = _ref[_i];
              track.streamUrl = _this.tracks.soundcloud[count].permalink_url;
              count += 1;
            }
            return _this.scope.clicked = false;
          });
        };
      })(this));
    };

    SoundsCtrl.prototype.searchLiveBands = function(track) {
      this.scope.clicked = true;
      this.newSong = {};
      console.log(track);
      return this.http.post("api/users/" + this.user.id + "/songs", {
        title: track.name,
        artist: track.artists[0].name,
        image: track.album.images[2].url,
        playthrough: false,
        url: track.streamUrl
      }).success((function(_this) {
        return function(data) {
          _this.songs.push(data);
          _this.newSong = data.song;
          return _this.http.post('api/searchlivebands', {
            track: track.artists[0].name
          }).success(function(data) {
            var listing, _i, _len;
            for (_i = 0, _len = data.length; _i < _len; _i++) {
              listing = data[_i];
              _this.http.post("api/songs/" + _this.newSong.id + "/venues", {
                venuename: listing.formatted_location + " **AT** " + listing.venue.name,
                venuedate: listing.formatted_datetime,
                rsvp: listing.facebook_rsvp_url
              });
            }
            return _this.songs.push(_this.newSong);
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
