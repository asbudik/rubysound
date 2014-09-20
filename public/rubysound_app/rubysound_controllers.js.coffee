SoundsControllers = angular.module("SoundsControllers", [])
class SoundsCtrl 
  
  constructor: (@scope, @http, @location, @Sound) ->
    @greeting = "hello worldsss"
    @tracks = []
    @http.get('api/users').success (data) =>
      console.log(data)
      @users = data
      if data.session
        @scope.signup = true

  searchSongs: (query) ->
    thisQuery = query
    @scope.query = {}
    @http.post('api/searchsongs', {query: query.string}).success (data) =>
      @scope.clicked = false
      @tracks = data.tracks.items
      @artists = data.artists

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

SoundsControllers.controller("SoundsCtrl", ["$scope", "$http", "$location", "Sound", SoundsCtrl])