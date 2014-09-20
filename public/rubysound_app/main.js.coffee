
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
    .when '/login',
      templateUrl: "templates/login.html",
      controller: "LoginCtrl as login"
    .when '/signup',
      templateUrl: "templates/signup.html",
      controller: "LoginCtrl as sign"
  .otherwise
    redirectTo: "/"

  $locationProvider.html5Mode(true).hashPrefix("#")
]