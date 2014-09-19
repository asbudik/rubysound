SoundsControllers = angular.module("SoundsControllers", [])

class SoundsCtrl 
  
  constructor: (@scope, @http, @Sound) ->
    @greeting = "hello worldsss"
    @tracks = []

  searchSongs: (query) ->
    @greeting = "you"
    thisQuery = query
    @scope.query = {}
    @http.post('api/searchsongs', {query: query.string}).success (data) =>
      console.log(data)
      @tracks = data.tracks.items
      @artists = data.artists

  searchLiveBands: (track) ->
    @scope.clicked = true
    @http.post('api/searchlivebands', {track: track.artists[0].name}).success (data) =>
      console.log(data)

SoundsControllers.controller("SoundsCtrl", ["$scope", "$http", "Sound", SoundsCtrl])