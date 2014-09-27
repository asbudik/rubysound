(function() {
  var SoundsApp;

  SoundsApp = angular.module("SoundsApp", ["ngRoute", "SoundsControllers", "plangular", "mediaPlayer"]);

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
    function SoundsCtrl(scope, http, location, filter, rootScope) {
      this.scope = scope;
      this.http = http;
      this.location = location;
      this.filter = filter;
      this.rootScope = rootScope;
      this.clientID = 'a193506e4d1a399fbb796fd18bfd3a3b';
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
          if (queueSong) {
            return _this.http.post('api/searchlivebands', {
              track: queueSong
            }).success(function(data) {
              return _this.venues = data;
            });
          }
        };
      })(this);
      this.scope.hideImage = false;
      this.scope.noDupeSongs = true;
      this.user = "";
      this.error = false;
      this.tracks = {};
      this.tracks.soundcloud = [];
      this.scope.songs = [];
      this.http.get('api/users').success((function(_this) {
        return function(data) {
          var song, user, vote, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2;
          _this.usersData = data;
          _this.users = _this.usersData.allusers;
          _this.scope.songs = _this.usersData.queue;
          if (_this.usersData.session) {
            _this.user = _this.usersData.session;
            _ref = _this.users;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              user = _ref[_i];
              if (user.id === _this.user.id) {
                user.auth = true;
              } else {
                user.auth = false;
              }
            }
            _this.scope.signup = true;
            _this.scope.loginshow = false;
            _this.scope.logoutbutton = true;
            _this.user.auth = true;
            if (_this.scope.songs !== []) {
              _ref1 = _this.scope.songs;
              for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                song = _ref1[_j];
                _ref2 = song[1];
                for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
                  vote = _ref2[_k];
                  if (vote.uservote === _this.user.id) {
                    song[0].voted = true;
                  }
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
            _this.scope.hideImage = false;
            return _this.http.post('api/searchlivebands', {
              track: _this.scope.songs[0][0].artist
            }).success(function(data) {
              var count;
              count = 0;
              return _this.venues = data;
            });
          } else {
            return _this.scope.hideImage = true;
          }
        };
      })(this));
      this.scope.addVote = (function(_this) {
        return function(song) {
          var index;
          song[0].voted = true;
          index = _this.scope.songs.indexOf(song);
          return _this.http.post("api/queues/" + song.id + "/votes", {
            song: song,
            user: _this.user.id
          }).success(function(data) {
            data.song.voted = true;
            song[1][0].count += 1;
            song[1][0].createdAt = data.vote.createdAt;
            if (_this.scope.songs.length > 1) {
              _this.rootScope.tracks[index].count += 1;
              _this.rootScope.tracks.sort(function(a, b) {
                if (a.count < b.count) {
                  return 1;
                }
                if (a.count > b.count) {
                  return -1;
                }
                console.log(a);
                console.log(b);
                if (a.createdAt < b.createdAt) {
                  return -1;
                }
                if (a.createdAt > b.createdAt) {
                  return 1;
                }
                return 0;
              });
              console.log("@rootscope tracks", _this.rootScope.tracks);
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
            }
            _this.scope.songs[0][0].playing = true;
            _this.scope.songs[0][0].count = 1000000;
            return console.log(_this.scope.songs);
          });
        };
      })(this);
    }

    SoundsCtrl.prototype.searchSongs = function(query) {
      var thisQuery;
      this.loading = true;
      thisQuery = query;
      this.scope.query = {};
      this.tracks = {};
      this.tracks.soundcloud = [];
      this.error = false;
      return this.http.post('api/soundcloud', {
        query: query.string
      }).success((function(_this) {
        return function(data) {
          var track, _i, _len;
          if (data.length > 0) {
            for (_i = 0, _len = data.length; _i < _len; _i++) {
              track = data[_i];
              if (track.streamable === true) {
                _this.tracks.soundcloud.push(track);
              }
            }
            _this.http.post('api/spotify', {
              query: query.string,
              limiter: _this.tracks.soundcloud.length
            }).success(function(data) {
              var count, _j, _len1, _ref, _results;
              _this.loading = false;
              _this.tracks.spotify = data;
              count = 0;
              _ref = _this.tracks.spotify.tracks.items;
              _results = [];
              for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
                track = _ref[_j];
                track.streamUrl = _this.tracks.soundcloud[count].permalink_url;
                track.soundcloudtitle = _this.tracks.soundcloud[count].title;
                _results.push(count += 1);
              }
              return _results;
            });
          } else {
            _this.error = true;
            _this.loading = false;
            _this.notice = "no results found";
          }
          return _this.scope.clicked = false;
        };
      })(this));
    };

    SoundsCtrl.prototype.searchLiveBands = function(track) {
      var params;
      this.scope.clicked = true;
      this.newQueue = {};
      this.newVote = {};
      params = {
        url: track.streamUrl,
        client_id: this.clientID,
        callback: 'JSON_CALLBACK'
      };
      return this.http.jsonp('//api.soundcloud.com/resolve.json', {
        params: params
      }).success((function(_this) {
        return function(data) {
          var user, _i, _len, _ref, _results;
          _this.http.post("api/users/" + _this.user.id + "/songs", {
            title: track.soundcloudtitle,
            artist: track.artists[0].name,
            image: track.album.images[0].url,
            playthrough: false,
            url: data.stream_url,
            duration: data.duration
          }).success(function(data) {
            _this.newQueue = data.queue;
            _this.newVote = data.vote;
            _this.scope.songs.push([_this.newQueue, [_this.newVote]]);
            _this.scope.noDupeSongs = true;
            if (_this.scope.songs.length === 1) {
              _this.scope.songs[0][1][0].count = 1000000;
              _this.scope.songs[0][0].playing = true;
              _this.scope.addVote(_this.scope.songs[0]);
              return _this.scope.getVenues(track.artists[0].name);
            }
          });
          _ref = _this.users;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            user = _ref[_i];
            if (user.id === _this.user.id) {
              user.contributions += 1;
              _results.push(user.image = track.album.images[0].url);
            } else {
              _results.push(void 0);
            }
          }
          return _results;
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
      user.contributions = 0;
      user.image = 'http://png-5.findicons.com/files/icons/1580/devine_icons_part_2/512/cd_music.png';
      return this.http.post('api/users', user).success((function(_this) {
        return function(data) {
          if (data.user) {
            _this.scope.user = {};
            return _this.http.post('/api/login', user).success(function(data) {
              _this.user = data.user;
              _this.user.auth = true;
              _this.scope.signup = true;
              _this.scope.loginshow = false;
              _this.scope.logoutbutton = true;
              _this.scope.showsearch = true;
              _this.users.push(data.user);
              _this.error = false;
              return _this.guestuser = false;
            });
          } else {
            _this.error = true;
            return _this.notice = data;
          }
        };
      })(this));
    };

    SoundsCtrl.prototype.login = function(user) {
      return this.http.post('api/login', user).success((function(_this) {
        return function(data) {
          var song, vote, _i, _len, _ref, _results;
          if (data.message) {
            _this.error = true;
            return _this.notice = data;
          } else {
            _this.user = data.user;
            _this.user.auth = true;
            _this.scope.signup = true;
            _this.scope.loginshow = false;
            _this.scope.logoutbutton = true;
            _this.scope.showsearch = true;
            _this.error = false;
            _this.guestuser = false;
            if (_this.scope.songs !== []) {
              _ref = _this.scope.songs;
              _results = [];
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                song = _ref[_i];
                _results.push((function() {
                  var _j, _len1, _ref1, _results1;
                  _ref1 = song[1];
                  _results1 = [];
                  for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
                    vote = _ref1[_j];
                    if (vote.uservote === this.user.id) {
                      _results1.push(song[0].voted = true);
                    } else {
                      _results1.push(void 0);
                    }
                  }
                  return _results1;
                }).call(_this));
              }
              return _results;
            }
          }
        };
      })(this));
    };

    SoundsCtrl.prototype.getLogin = function() {
      this.scope.loginshow = true;
      this.scope.signup = true;
      return this.error = false;
    };

    SoundsCtrl.prototype.getSignUp = function() {
      this.scope.loginshow = false;
      this.scope.signup = false;
      return this.error = false;
    };

    return SoundsCtrl;

  })();

  SoundsControllers.controller("SoundsCtrl", ["$scope", "$http", "$location", "$filter", "$rootScope", SoundsCtrl]);

}).call(this);
