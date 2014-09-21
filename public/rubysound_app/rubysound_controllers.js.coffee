SoundsControllers = angular.module("SoundsControllers", [])
class SoundsCtrl 
  
  constructor: (@scope, @http, @location, @Sound) ->
    @user = ""
    @tracks = {}
    @tracks.soundcloud = []
    @songs = []
    @http.get('api/users').success (data) =>
      @users = data
      if data.session
        @user = data.session
        @scope.signup = true
        @scope.loginshow = false
        @scope.showsearch = true
        @scope.logoutbutton = true

  searchSongs: (query) ->
    thisQuery = query
    @scope.query = {}
    @http.post('api/soundcloud', {query: query.string}).success (data) =>

      for track in data
        if track.streamable == true
          @tracks.soundcloud.push(track)


      @http.post('api/spotify', {query: query.string, limiter: @tracks.soundcloud.length}).success (data) =>
        @tracks.spotify = data

        count = 0
        for track in @tracks.spotify.tracks.items
          track.streamUrl = @tracks.soundcloud[count].permalink_url
          track.soundcloudtitle = @tracks.soundcloud[count].title
          count += 1


        @scope.clicked = false

  searchLiveBands: (track) ->
    @scope.clicked = true
    @newSong = {}
    console.log(track)
    @http.post("api/users/#{@user.id}/songs", {title: track.name, artist: track.artists[0].name, image: track.album.images[2].url, playthrough: false, url: track.streamUrl}).success (data) =>
      @songs.push(data)
      @newSong = data.song
      @http.post('api/searchlivebands', {track: track.artists[0].name}).success (data) =>
        for listing in data
          @http.post("api/songs/#{@newSong.id}/venues", {venuename: listing.formatted_location + " **AT** " + listing.venue.name, venuedate: listing.formatted_datetime, rsvp: listing.facebook_rsvp_url})
        
      @songs.push(@newSong)

  # signup: (user) ->
  #   @http.post('api/users', user).success (data) =>
  #     console.log(data.user)
  #     if data.user
  #       @scope.user = {}
  #       @http.post('/api/login', user).success (data) =>
  #         console.log(data)
  #         @scope.signup = true
  #         @scope.loginshow = false
  #         @scope.logoutbutton = true
  #         @scope.showsearch = true

  # login: (user) ->
  #   @http.post('api/login', user).success (data) =>
  #     if data.message
  #       @notice = data.message
  #     else
  #       @notice = "Welcome back!"
  #       @scope.signup = true
  #       @scope.loginshow = false
  #       @scope.logoutbutton = true
  #       @scope.showsearch = true

  getLogin: () ->
    console.log('geti')
    @scope.loginshow = true
    @scope.signup = true

  getSignUp: () ->
    @scope.loginshow = false
    @scope.signup = false

SoundsControllers.controller("SoundsCtrl", ["$scope", "$http", "$location", "Sound", SoundsCtrl])