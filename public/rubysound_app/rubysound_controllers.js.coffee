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
      @tracks = data.tracks.items
      console.log(@tracks)
      @artists = data.artists

SoundsControllers.controller("SoundsCtrl", ["$scope", "$http", "Sound", SoundsCtrl])