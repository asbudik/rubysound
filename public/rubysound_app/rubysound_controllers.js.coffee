SoundsControllers = angular.module("SoundsControllers", [])

class SoundsCtrl 
  
  constructor: (@scope, @http, @Sound, @Key) ->
    @greeting = "hello worldsss"
    SC.initialize(({
      client_id: 'YOUR_CLIENT_ID'
    });)

  searchSongs: (query) ->
    SC.get "/tracks", {q: "owl city"}, (tracks) ->
      console.log tracks

SoundsControllers.controller("SoundsCtrl", ["$scope", "$http", "Sound", SoundsCtrl])