// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova', 'starter-controllers'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.constant('ApiEndpoint', {
  url: '/srv',
})

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
  .state('map', {
    url: '/map',
    templateUrl: 'templates/map.html',
    controller: 'MapCtrl'
  })
  .state('newUser', {
    url: '/newUser',
    templateUrl: 'templates/newUser.html',
    controller: 'UserCtrl'
  })
  .state('showRoutes', {
    url: '/showRoutes',
    templateUrl: 'templates/showRoutes.html',
    controller: 'RouteCtrl'
  })
  .state('problemRoutes', {
    url: '/problemRoutes',
    templateUrl: 'templates/problemRoutes.html',
    controller: 'problemRouteCtrl'
  })
  .state('rideReportShowRoutes', {
    url: '/rideReportShowRoutes',
    templateUrl: 'templates/rideReportShowRoutes.html',
    controller: 'rideReportRouteCtrl'
  });

  $urlRouterProvider.otherwise("/newUser");

})
;
