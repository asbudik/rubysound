SoundsControllers = angular.module("SoundsControllers", [])

class SoundsCtrl 

  constructor: (@scope, @http) ->
    @greeting = "hello world"



SoundsControllers.controller("SoundsCtrl", ["$scope", "$http", SoundsCtrl])