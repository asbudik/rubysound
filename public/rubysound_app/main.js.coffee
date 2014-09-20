
SoundsApp = angular.module("SoundsApp", [
  "ngRoute",
  "SoundsControllers",
  "SoundsFactories"
])

SoundsApp.config ["$routeProvider", "$locationProvider", ($routeProvider, $locationProvider) ->
  $routeProvider
    .when '/',
      templateUrl: "templates/spa.html",
      controller: "SoundsCtrl as sounds"
  .otherwise
    redirectTo: "/"

  $locationProvider.html5Mode(true).hashPrefix("#")
]