/*

        PLANGULAR
        A Highly Customizable SoundCloud Player

        Angular Version

        http://jxnblk.github.io/Plangular

 */

(function() {

'use strict';

var plangular = angular.module('plangular', []),
    clientID = 'a193506e4d1a399fbb796fd18bfd3a3b';

plangular.directive('plangular', ['$http', '$rootScope', function ($http, $rootScope) {
  var audio = document.createElement('audio');
  $rootScope.count = 0
  $rootScope.increment = 0

  $rootScope.tracks = []
  $rootScope.socket = io.connect('https://rubysound.herokuapp.com')
  // $rootScope.socket = io.connect('http://localhost:3000')



  var player = {

    currentTrack: false,
    playing: false,
    // tracks: [],
    i: 0,
    playlistIndex: 0,
    data: {},
    currentTime: 0,
    duration: 0,

    load: function(track, index) {
      console.log("IN LOAD")
      // console.log("THIS IS INDEX", index)
      // this.tracks[index] = track;
      track.count = 10
      track.createdAt = Date.now()
      $rootScope.tracks.push(track)
      // console.log("LOADTHIS", this)
      console.log("ROOTSCOPE TRACKS", $rootScope.tracks)
      if (!this.playing && !this.i && index == 0) {
        console.log("INSIDE IF STATEMENT")
        $rootScope.$$childHead.songs[0][0].playing = true
        this.currentTrack = $rootScope.tracks[0];
        // console.log("THIS CURRENT TRACK", this.currentTrack)
        this.playing = track;
        this.play();
        // audio.play();
        // player.play();
      }
    },

    play: function(index, playlistIndex) {
      // console.log("AM I IN PLAY?")
      this.i = index || 0;
      var track = $rootScope.tracks[this.i];
      // console.log("PLAY TRACK", track)
      track.count = 1000000
      if (track.tracks) {
        this.playlistIndex = playlistIndex || 0;
        this.playing = track.tracks[this.playlistIndex];
        var src = track.tracks[this.playlistIndex].url + '?client_id=' + clientID;
        // console.log("IF SRC", src)
      } else {
        this.playing = track;
        var src = track.url + '?client_id=' + clientID;
        // console.log("ELSE SRC", src)
      }
      this.currentTrack = this.playing;
      if (src != audio.src) audio.src = src;
      // console.log("AUDIO PLAY", audio)
      audio.play();
      // console.log("PLAYER DURATION PLAY", player.duration)
      setTimeout(function() {
        console.log("PLAYER DURATION SET TIMEOUT", player.duration)
        if (player.duration !== NaN && player.duration > 0) {
          console.log("PLAY TIME")
        } else {
          if ($rootScope.$$childHead.songs.length) {
      // $rootScope.increment -= 1
      // $rootScope.index += 1
            // console.log("INCREMENT ROOTSCOPE", $rootScope.index)
            if ($rootScope.$$childHead.songs.length > 0) {
              $rootScope.$$childHead.popFromQueue($rootScope.$$childHead.songs[0]);
              // console.log("THIS DATA NEXT", player.data)
              // console.log("SONGS URL", $rootScope.$$childHead.songs[0][0].url)
              // delete player.data[$rootScope.$$childHead.songs[0][0].url]
              // $rootScope.socket.emit("send delete song", {tracks: $rootScope.tracks, songs: $rootScope.$$childHead.songs})
              $rootScope.tracks.shift()
              $rootScope.$$childHead.songs.shift();
              $rootScope.increment -= 1
              // console.log("PLAYER DATA", player.data)

              // console.log("this index", player)
              if ($rootScope.$$childHead.songs.length > 0) {
                $rootScope.$$childHead.songs[0][0].playing = true
                $rootScope.$$childHead.songs[0][1][0].count = 1000000
                $rootScope.$$childHead.songs[0][0].playing = true
                $rootScope.$$childHead.songs[0][0].currentTime = 1
                $rootScope.$$childHead.songs[0][0].duration = 32334

                // player.tracks.push($rootScope.$$childHead.songs[0][0])

                // $rootScope.$$childHead.getCurrent($rootScope.$$childHead.songs[0][0].id)
                $rootScope.$$childHead.addVote($rootScope.$$childHead.songs[0])

                $rootScope.$$childHead.getVenues($rootScope.$$childHead.songs[0][0].artist)

                // if ($rootScope.$$childHead.songs.length < 3) {
                //   $rootScope.$$childHead.getSong(staticTracks[0])
                //   $rootScope.$$childHead.getSong(staticTracks[1])
                // }
              }
              if ($rootScope.$$childHead.songs.length === 0) {
                player.pause();
                $rootScope.$$childHead.hideImage = true
                return
              }
            }
            // console.log("player next")
            player.next();
          } else {
            // console.log("player pause")
            player.pause();
          }
        }
      }, 3000)
    },

    pause: function() {
      // $rootScope.index = 0
      // console.log("PAUSE THIS TRACKS", this.tracks)
      $rootScope.tracks = []
      this.currentTrack = false
      this.currentTime = 0
      this.duration = 0
      // this.i = 0;
      this.playing = false;
      // console.log("INSIDE PAUSE THIS", this)
      audio.pause();
    },

    playPause: function(i, playlistIndex) {
      var track = $rootScope.tracks[i];
      if (track.tracks && this.playing != track.tracks[playlistIndex]) {
        this.play(i, playlistIndex);
      } else if (!track.tracks && this.playing != track) {
        this.play(i);
      } else {
        this.pause();
      }
    },

    next: function() {
      // console.log("NEXT ROOTSCOPE", $rootScope)
      var playlist = $rootScope.tracks[this.i].tracks || null;
      if (playlist && this.playlistIndex < playlist.length - 1) {
        // console.log("PLAYLIST LESS THAN")
        // this.playlistIndex++;
        this.play(this.i, this.playlistIndex);
        // console.log("THIS I", this.i)
        // console.log("THIS TRACKS LENGTH", this.tracks.length)
      } else if (this.i <= $rootScope.tracks.length - 1) {
        // this.i++;
        // Handle advancing to new playlist
        // console.log("this", this)
        // console.log("THIS TRACKS BEFORE", this)
        if ($rootScope.tracks[this.i].tracks) {
          // console.log("THIS TRACKS", this.tracks)
          var playlist = $rootScope.tracks[this.i].tracks || null;
          this.playlistIndex = 0;
          this.play(this.i, this.playlistIndex);
        } else {
          // console.log("THIS PLAY I", this.i)
          // console.log("THIS TRACKS LENGTH IN ELSE", this.tracks.length)
          this.play(this.i);
        }
        // console.log("THIS I PAUSE", this.i)
        // console.log("ROOTSCOPE LENGTH", $rootScope.tracks.length)
      } else if (this.i > $rootScope.tracks.length - 1) {
        // console.log("THIS PAUSE")
        // this.i = 0
        this.pause();
        // console.log("THIS PAUSE", this)
        // console.log("THIS TRACKS PAUSE", this.tracks)
      }
    },

    previous: function() {
      var playlist = $rootScope.tracks[this.i].tracks || null;
      if (playlist && this.playlistIndex > 0) {
        this.playlistIndex--;
        this.play(this.i, this.playlistIndex);
      } else if (this.i > 0) {
        this.i--;
        if ($rootScope.tracks[this.i].tracks) {
          this.playlistIndex = $rootScope.tracks[this.i].tracks.length - 1;
          this.play(this.i, this.playlistIndex);
        } else {
          this.play(this.i);
        }
      }
    },

    seek: function(e) {
      if (!audio.readyState) return false;
      var xpos = e.offsetX / e.target.offsetWidth;
      audio.currentTime = (xpos * audio.duration);
    }

  };

  audio.addEventListener('timeupdate', function() {
    player.currentTime = audio.currentTime;
    player.duration = audio.duration;
  }, false);

  audio.addEventListener('ended', function() {

    $rootScope.socket.emit('send delete song', $rootScope.tracks)


  }, false);

  $rootScope.socket.on('get delete song', function(deleteSongs) {
    if ($rootScope.$$childHead.songs.length) {
      // $rootScope.increment -= 1
      // $rootScope.index += 1
      // console.log("INCREMENT ROOTSCOPE", $rootScope.index)
      if ($rootScope.$$childHead.songs.length) {
        $rootScope.$$childHead.popFromQueue($rootScope.$$childHead.songs[0]);
        // console.log("THIS DATA NEXT", player.data)
        // console.log("SONGS URL", $rootScope.$$childHead.songs[0][0].url)
        // delete player.data[$rootScope.$$childHead.songs[0][0].url]
        // $rootScope.socket.emit("send delete song", {tracks: $rootScope.tracks, songs: $rootScope.$$childHead.songs})
        $rootScope.tracks.shift()
        $rootScope.$$childHead.songs.shift();
        $rootScope.increment -= 1
        player.currentTime = 0
        player.duration = 0
        // console.log("PLAYER DATA", player.data)

        // console.log("this index", player)
        if ($rootScope.$$childHead.songs.length > 0) {
          $rootScope.$$childHead.songs[0][0].playing = true
          $rootScope.$$childHead.songs[0][1][0].count = 1000000
          $rootScope.$$childHead.songs[0][0].playing = true
          $rootScope.$$childHead.songs[0][0].currentTime = 1
          $rootScope.$$childHead.songs[0][0].duration = 32334

          // player.tracks.push($rootScope.$$childHead.songs[0][0])

          // $rootScope.$$childHead.getCurrent($rootScope.$$childHead.songs[0][0].id)
          $rootScope.$$childHead.addVote($rootScope.$$childHead.songs[0])

          $rootScope.$$childHead.getVenues($rootScope.$$childHead.songs[0][0].artist)

          // if ($rootScope.$$childHead.songs.length < 3) {
          //   $rootScope.$$childHead.getSong(staticTracks[0])
          //   $rootScope.$$childHead.getSong(staticTracks[1])
          // }
        }
        if ($rootScope.$$childHead.songs.length === 0) {
          player.duration = 0
          player.curentTime = 0
          player.pause();
          $rootScope.$$childHead.hideImage = true
          return
        }
      }
  // console.log("player next")
  player.next();
  } else {
  // console.log("player pause")
  player.pause();
  }
})

  var count = 0
  if (!$rootScope.index) {
    $rootScope.index = 0
    // console.log("ROOTSCOPE", $rootScope)
  }
  // console.log("ROOTSCOPE OUTSIDE OF IF STATEMENT", $rootScope)

  return {

    restrict: 'A',
    scope: true,

    link: function (scope, elem, attrs) {

      if (!$rootScope.count) {
        $rootScope.count = 0
        // $rootScope.increment = 0
      }
      // console.log("$rootscope", $rootScope.$$childHead)
      // if ($rootScope.$$childHead) {
        if ($rootScope.$$childHead.songs.length > 0 && $rootScope.count > 0) {
      //     // console.log("ROOTSCOPE CHILD SONGS", $rootScope.$$childHead.songs)
      //     // console.log("ROOTSCOPE COUNT", $rootScope.increment)
          var src = $rootScope.$$childHead.songs[$rootScope.increment][0].url;
      //     var params = { url: src, client_id: clientID, callback: 'JSON_CALLBACK' }
      //     $rootScope.increment += 1
        }
      $rootScope.count += 1
      // }

      scope.player = player;
      scope.audio = audio;
      scope.currentTime = 0;
      scope.duration = 0;
      if (src) {
        // console.log("SCOPE INDEX IS", scope.index)
        // console.log("SCOPE INDEX INCREMEMNT", scope.index)
      }

      function addKeys(track) {
        for (var key in track) {
          scope[key] = track[key];
        }
      }

      if (!src) {
        console.log("NO SOURCE")
        // console.log("!src")
        // console.log('no source')
        //console.log('no src');
      }
      // // else if (player.data[src]) {
      // //   console.log("PLAYER DATA", player)
      // //   // console.log("playerdata", player.data)
      // //   scope.track = player.data[src];
      // //   addKeys(scope.track);
      // // }
      else {
        // console.log("BEFORE DUPE")
        // if ($rootScope.$$childHead.noDupeSongs === true) {
          // console.log("AFTER DUPE")
          // console.log("WHY")
          // var count = 0

          // $http.jsonp('//api.soundcloud.com/resolve.json', { params: params }).success(function(data){
            // console.log("INSIDE JSON", data)
            // if (count === 0) {
            // console.log("COUNT IS", count)
            // count += 1
            if ($rootScope.$$childHead.songs.length > 0 && $rootScope) {
              $rootScope.$$childHead.hideImage = false
              // console.log("HTTP SOUNDCLOUD")
              // delete player.data[$rootScope.$$childHead.songs[0][0].url]
              console.log("$ROOTSCOPE INCREMENT", $rootScope.increment)
              console.log("ROOTSCOPE SONGS", $rootScope.$$childHead.songs)
              scope.track = $rootScope.$$childHead.songs[$rootScope.increment][0];
              // console.log($rootScope.$$childHead.songs[$rootScope.increment][0].duration)
              addKeys(scope.track);
              player.data[src] = $rootScope.$$childHead.songs[$rootScope.increment][0];
              // console.log("SCOPE IN REQUEST", scope)
              player.load($rootScope.$$childHead.songs[$rootScope.increment][0], $rootScope.index);
              console.log("PLAYER LOAD?", $rootScope.$$childHead.songs[$rootScope.increment][0])
              // $rootScope.$$childHead.noDupeSongs = false
              $rootScope.increment += 1
          // });
        }
      }

      scope.play = function(playlistIndex) {
        player.play($rootScope.index, playlistIndex);
      };

      scope.pause = function() {
        player.pause();
      };

      scope.playPause = function(playlistIndex) {
        player.playPause($rootScope.index, playlistIndex);
      };

      scope.next = function() {
        player.next();
      };

      scope.previous = function() {
        player.previous();
      };

      audio.addEventListener('timeupdate', function() {
        // console.log("TIME DURATION", player.duration)
        if (scope.track == $rootScope.tracks[player.i]){
          scope.$apply(function() {
            // console.log("PLAYER DURATION", player.duration)
            scope.currentTime = player.currentTime;
            scope.duration = player.duration;
          });
        };
      }, false);

      audio.addEventListener('ended', function() {
        // console.log("ended:link:this", this);
        // console.log("ended:link:scope", scope)
      }, false);

      scope.seek = function(e){
        if ($rootScope.tracks[player.i] == scope.track) {
          player.seek(e);
        }
      };

    }

  }

}]);


// Plangular Icons
plangular.directive('plangularIcon', function() {

  var sprite = {
    play: 'M0 0 L32 16 L0 32 z',
    pause: 'M0 0 H12 V32 H0 z M20 0 H32 V32 H20 z',
    previous: 'M0 0 H4 V14 L32 0 V32 L4 18 V32 H0 z',
    next: 'M0 0 L28 14 V0 H32 V32 H28 V18 L0 32 z',
    close: 'M4 8 L8 4 L16 12 L24 4 L28 8 L20 16 L28 24 L24 28 L16 20 L8 28 L4 24 L12 16 z',
    chevronRight: 'M12 1 L26 16 L12 31 L8 27 L18 16 L8 5 z',
    chevronLeft: 'M20 1 L24 5 L14 16 L24 27 L20 31 L6 16 z',
    heart: 'M0 10 C0 6, 3 2, 8 2 C12 2, 15 5, 16 6 C17 5, 20 2, 24 2 C30 2, 32 6, 32 10 C32 18, 18 29, 16 30 C14 29, 0 18, 0 10'
  };

  return {

    restrict: 'A',
    scope: true,
    link: function (scope, elem, attrs) {

      var el = elem[0],
          id = attrs.plangularIcon,
          path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

      if (!sprite[id]) {
        var availableIcons = '';
        for (var key in sprite) {
          availableIcons += key + ', ';
        };
        console.error(
          'No icon found for ' + id + '.\n\n' +
          'Icons available:\n'+
          availableIcons + '\n\n' +
          'More icons available from http://jxnblk.github.io/geomicons-open'
        );
        return false;
      }

      el.classList.add('plangular-icon', 'plangular-icon-'+id);
      el.setAttribute('viewBox', '0 0 32 32');
      el.setAttribute('style', 'max-height:100%');
      el.setAttribute('fill', 'currentColor');
      path.setAttribute('d', sprite[id]);
      el.appendChild(path);

    }

  }

});


// Filter to convert milliseconds to hours, minutes, seconds
plangular.filter('prettyTime', function() {
  return function(value) {
    var hours = Math.floor(value / 3600),
        mins = '0' + Math.floor((value % 3600) / 60),
        secs = '0' + Math.floor((value % 60));
        mins = mins.substr(mins.length - 2);
        secs = secs.substr(secs.length - 2);
    if(!isNaN(secs)){
      if (hours){
        return hours+':'+mins+':'+secs;
      } else {
        return mins+':'+secs;
      };
    } else {
      return '00:00';
    };
  };
});


})();
