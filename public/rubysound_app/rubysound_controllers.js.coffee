SoundsControllers = angular.module("SoundsControllers", [])

class SoundsCtrl 
  
  constructor: (@scope, @http, @Sound) ->
    @greeting = "hello worldsss"
    @tracks = []
    console.log(@)

  searchSongs: (query) ->
    @greeting = "you"
    thisQuery = query
    @scope.query = {}
    console.log(query.string)
    @http.post('api/searchsongs', {query: query.string}).success (data) =>
      console.log(data)
      @tracks = data

SoundsControllers.controller("SoundsCtrl", ["$scope", "$http", "Sound", SoundsCtrl])