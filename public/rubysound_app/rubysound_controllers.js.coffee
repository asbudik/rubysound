SoundsControllers = angular.module("SoundsControllers", [])

class SoundsCtrl 

  constructor: (@scope, @http) ->
    @greeting = "hello worldsss"

  searchSongs: (query) ->
    @tracks = SC.get "/tracks", q: "buskers", (tracks) ->
      console.log @tracks



SoundsControllers.controller("SoundsCtrl", ["$scope", "$http", SoundsCtrl])