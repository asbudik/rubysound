SoundsControllers = angular.module("SoundsControllers", [])

class SoundsCtrl 

  constructor: (@scope, @http) ->
    @greeting = "hello worldsss"



SoundsControllers.controller("SoundsCtrl", ["$scope", "$http", SoundsCtrl])