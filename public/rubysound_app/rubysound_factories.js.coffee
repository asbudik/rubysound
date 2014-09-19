SoundsFactories = angular.module("SoundsFactories", [])

class Sound

  constructor: (@http) ->
    console.log("hello world")


SoundsFactories.factory("Sound", ["$http", Sound])