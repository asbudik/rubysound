SoundsControllers = angular.module("SoundsControllers", [])
class SoundsCtrl 
  
  constructor: (@scope, @http, @location, @Sound) ->
    @greeting = "hello worldsss"
    @tracks = {}
    @http.get('api/users').success (data) =>
      console.log(data)
      @users = data
      if data.session
        @scope.signup = true
        @scope.loginshow = false
        @scope.showsearch = true
        @scope.logoutbutton = true

  searchSongs: (query) ->
    thisQuery = query
    @scope.query = {}
    @http.post('api/soundcloud', {query: query.string}).success (data) =>
      @scope.clicked = false
      @tracks.soundcloud = data
      @http.post('api/spotify', {query: query.string}).success (data) =>
        @tracks.spotify = data

        console.log(@tracks)

  searchLiveBands: (track) ->
    @scope.clicked = true
    @http.post('api/searchlivebands', {track: track.artists[0].name}).success (data) =>
      console.log(data)

  signup: (user) ->
    @http.post('api/users', user).success (data) =>
      console.log(data.user)
      if data.user
        @scope.user = {}
        @http.post('/api/login', user).success (data) =>
          console.log(data)
          @scope.signup = true
          @scope.loginshow = false
          @scope.logoutbutton = true
          @scope.showsearch = true

  login: (user) ->
    @http.post('api/login', user).success (data) =>
      if data.message
        @notice = data.message
      else
        @notice = "Welcome back!"
        @scope.signup = true
        @scope.loginshow = false
        @scope.logoutbutton = true
        @scope.showsearch = true

  getLogin: () ->
    console.log('geti')
    @scope.loginshow = true
    @scope.signup = true

  getSignUp: () ->
    @scope.loginshow = false
    @scope.signup = false

SoundsControllers.controller("SoundsCtrl", ["$scope", "$http", "$location", "Sound", SoundsCtrl])