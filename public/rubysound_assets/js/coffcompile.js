(function() {
  var SoundsApp;

  SoundsApp = angular.module("SoundsApp", ["ngRoute", "SoundsControllers", "SoundsFactories", "plangular", "mediaPlayer"]);

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
    function SoundsCtrl(scope, http, location, filter, Sound) {
      var orderBy;
      this.scope = scope;
      this.http = http;
      this.location = location;
      this.filter = filter;
      this.Sound = Sound;
      this.scope.showsearch = true;
      orderBy = this.filter('orderBy');
      this.user = "";
      this.tracks = {};
      this.tracks.soundcloud = [];
      this.songs = [];
      this.http.get('api/users').success((function(_this) {
        return function(data) {
          var song, vote, _i, _j, _len, _len1, _ref, _ref1;
          _this.users = data;
          _this.songs = data.queue;
          if (data.session) {
            _this.user = data.session;
            _this.scope.signup = true;
            _this.scope.loginshow = false;
            _this.scope.logoutbutton = true;
            _ref = _this.songs;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              song = _ref[_i];
              _ref1 = song[1];
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                vote = _ref1[_j];
                if (vote.uservote === _this.user.id) {
                  song[0].voted = true;
                }
              }
            }
          } else {
            _this.guestuser = true;
            _this.scope.showsearch = false;
          }
          _this.songs.sort(function(a, b) {
            if (a[1][0].count < b[1][0].count) {
              return 1;
            }
            if (a[1][0].count > b[1][0].count) {
              return -1;
            }
            console.log(a);
            console.log(b);
            if (a[1][0].createdAt < b[1][0].createdAt) {
              return -1;
            }
            if (a[1][0].createdAt > b[1][0].createdAt) {
              return 1;
            }
            return 0;
          });
          return console.log(_this.songs);
        };
      })(this));
    }

    SoundsCtrl.prototype.searchSongs = function(query) {
      var thisQuery;
      thisQuery = query;
      this.scope.query = {};
      this.tracks = {};
      this.tracks.soundcloud = [];
      return this.http.post('api/soundcloud', {
        query: query.string
      }).success((function(_this) {
        return function(data) {
          var track, _i, _len;
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            track = data[_i];
            if (track.streamable === true) {
              _this.tracks.soundcloud.push(track);
            }
          }
          return _this.http.post('api/spotify', {
            query: query.string,
            limiter: _this.tracks.soundcloud.length
          }).success(function(data) {
            var count, _j, _len1, _ref;
            _this.tracks.spotify = data;
            count = 0;
            _ref = _this.tracks.spotify.tracks.items;
            for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
              track = _ref[_j];
              track.streamUrl = _this.tracks.soundcloud[count].permalink_url;
              track.soundcloudtitle = _this.tracks.soundcloud[count].title;
              count += 1;
            }
            return _this.scope.clicked = false;
          });
        };
      })(this));
    };

    SoundsCtrl.prototype.searchLiveBands = function(track) {
      console.log(track);
      this.scope.clicked = true;
      this.newQueue = {};
      this.newVote = {};
      return this.http.post("api/users/" + this.user.id + "/songs", {
        title: track.soundcloudtitle,
        artist: track.artists[0].name,
        image: track.album.images[0].url,
        playthrough: false,
        url: track.streamUrl
      }).success((function(_this) {
        return function(data) {
          _this.newQueue = data.queue;
          _this.newVote = data.vote;
          _this.http.post('api/searchlivebands', {
            track: track.artists[0].name
          }).success(function(data) {
            var listing, _i, _len, _results;
            _results = [];
            for (_i = 0, _len = data.length; _i < _len; _i++) {
              listing = data[_i];
              _results.push(_this.http.post("api/songs/" + _this.newQueue.id + "/venues", {
                venuename: listing.formatted_location + " **AT** " + listing.venue.name,
                venuedate: listing.formatted_datetime,
                rsvp: listing.facebook_rsvp_url
              }));
            }
            return _results;
          });
          return _this.songs.push([_this.newQueue, [_this.newVote]]);
        };
      })(this));
    };

    SoundsCtrl.prototype.deleteQueueItem = function(queueItem) {
      return this.http["delete"]("api/queues/" + this.songs[0].id).success((function(_this) {
        return function(data) {
          _this.songs.shift();
          return true;
        };
      })(this));
    };

    SoundsCtrl.prototype.addVote = function(song) {
      song[0].voted = true;
      song;
      return this.http.post("api/queues/" + song.id + "/votes", {
        song: song,
        user: this.user.id
      }).success((function(_this) {
        return function(data) {
          song[1][0].count += 1;
          console.log(data.vote);
          _this.songs.push([data.song, [data.vote]]);
          return _this.songs.sort(function(a, b) {
            if (a[1][0].count < b[1][0].count) {
              return 1;
            }
            if (a[1][0].count > b[1][0].count) {
              return -1;
            }
            if (a[1][0].createdAt < b[1][0].createdAt) {
              return -1;
            }
            if (a[1][0].createdAt > b[1][0].createdAt) {
              return 1;
            }
            return 0;
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

  SoundsControllers.controller("SoundsCtrl", ["$scope", "$http", "$location", "$filter", "Sound", SoundsCtrl]);

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
