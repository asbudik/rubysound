SoundsControllers = angular.module("SoundsControllers", [])

class SoundsCtrl 
  
  constructor: (@scope, @http, @Sound) ->
    @greeting = "hello worldsss"
    @tracks = []

  searchSongs: (query) ->
    thisQuery = query
    @scope.query = {}
    @http.post('api/searchsongs', {query: query.string}).success (data) =>
      @scope.clicked = false
      console.log(data)
      @tracks = data.tracks.items
      @artists = data.artists

  searchLiveBands: (track) ->
    @scope.clicked = true
    @http.post('api/searchlivebands', {track: track.artists[0].name}).success (data) =>
      console.log(data)

SoundsControllers.controller("SoundsCtrl", ["$scope", "$http", "Sound", SoundsCtrl])

class LoginCtrl

  constructor: (@scope, @http) ->
    @logingreeting = "greetings"

  signup: (user) ->
    console.log(user)
    @http.post('api/users', user).success (data) =>
      console.log(data)

SoundsControllers.controller("LoginCtrl", ["$scope", "$http", LoginCtrl])