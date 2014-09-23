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
      this.scope = scope;
      this.http = http;
      this.location = location;
      this.filter = filter;
      this.Sound = Sound;
      this.scope.popFromQueue = (function(_this) {
        return function(trackToDelete) {
          return _this.http["delete"]("api/queues/" + trackToDelete[0].id).success(function(data) {});
        };
      })(this);
      this.scope.showsearch = true;
      this.venues = {};
      this.scope.getVenues = (function(_this) {
        return function(queueSong) {
          _this.venues = {};
          console.log('am i being called');
          return _this.http.post('api/searchlivebands', {
            track: queueSong
          }).success(function(data) {
            return _this.venues = data;
          });
        };
      })(this);
      this.user = "";
      this.tracks = {};
      this.tracks.soundcloud = [];
      this.scope.songs = [];
      this.http.get('api/users').success((function(_this) {
        return function(data) {
          var song, vote, _i, _j, _len, _len1, _ref, _ref1;
          _this.usersData = data;
          _this.users = _this.usersData;
          _this.scope.songs = _this.usersData.queue;
          if (_this.usersData.session) {
            _this.user = _this.usersData.session;
            _this.scope.signup = true;
            _this.scope.loginshow = false;
            _this.scope.logoutbutton = true;
            _this.user.auth = true;
            _ref = _this.scope.songs;
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
          _this.scope.songs.sort(function(a, b) {
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
          if (_this.scope.songs.length > 0) {
            return _this.http.post('api/searchlivebands', {
              track: _this.scope.songs[0][0].artist
            }).success(function(data) {
              var count;
              count = 0;
              _this.venues = data;
              return console.log("venues", _this.venues);
            });
          }
        };
      })(this));
      this.scope.addVote = (function(_this) {
        return function(song) {
          var index;
          song[0].voted = true;
          console.log("scope", _this.scope);
          index = _this.scope.songs.indexOf(song);
          return _this.http.post("api/queues/" + song.id + "/votes", {
            song: song,
            user: _this.user.id
          }).success(function(data) {
            _this.scope.songs.splice(index, 1);
            data.song.voted = true;
            song[1][0].count += 1;
            _this.scope.songs.push([data.song, [data.vote]]);
            return _this.scope.songs.sort(function(a, b) {
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
              0;
              return _this.scope.songs[0][0].count = 1000000;
            });
          });
        };
      })(this);
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
          return _this.http.post('api/searchlivebands', {
            track: track.artists[0].name
          }).success(function(data) {
            var listing, singleVenue, _i, _j, _len, _len1;
            for (_i = 0, _len = data.length; _i < _len; _i++) {
              listing = data[_i];
              _this.http.post("api/songs/" + _this.newQueue.id + "/venues", {
                venuename: listing.formatted_location + " **AT** " + listing.venue.name,
                venuedate: listing.formatted_datetime,
                rsvp: listing.ticket_url
              }).success(function(data) {});
            }
            _this.venuesArray = [];
            for (_j = 0, _len1 = data.length; _j < _len1; _j++) {
              singleVenue = data[_j];
              _this.venuesArray.push({
                venuename: singleVenue.formatted_location + "**AT**" + singleVenue.venue.name,
                venuedate: singleVenue.formatted_datetime,
                rsvp: singleVenue.ticket_url
              });
            }
            _this.scope.getVenues(track.artists[0].name);
            _this.scope.songs.push([_this.newQueue, [_this.newVote]]);
            console.log("THIS IS SCOPE SONGS", _this.scope.songs);
            if (_this.scope.songs.length === 1) {
              _this.scope.songs[0][1][0].count = 1000000;
              console.log("scope votes", _this.scope.songs[0][1][0]);
              _this.scope.songs[0][0].playing = true;
              return _this.scope.addVote(_this.scope.songs[0]);
            }
          });
        };
      })(this));
    };

    SoundsCtrl.prototype.deleteQueueItem = function(queueItem) {
      return this.http["delete"]("api/queues/" + this.scope.songs[0].id).success((function(_this) {
        return function(data) {
          _this.scope.songs.shift();
          return true;
        };
      })(this));
    };

    SoundsCtrl.prototype.signup = function(user) {
      return this.http.post('api/users', user).success((function(_this) {
        return function(data) {
          console.log("data", data);
          if (data.user) {
            _this.scope.user = {};
            return _this.http.post('/api/login', user).success(function(data) {
              console.log("data", data);
              _this.user = data.user;
              _this.user.auth = true;
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
          console.log("login data", data);
          if (data.message) {
            return _this.notice = data.message;
          } else {
            _this.notice = "Welcome back!";
            _this.user = data.user;
            _this.user.auth = true;
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
