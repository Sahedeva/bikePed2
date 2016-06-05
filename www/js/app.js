// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova'])

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
  });

  $urlRouterProvider.otherwise("/newUser");

})

.controller('UserCtrl', function($scope, $state, $http, $location) {
  $scope.name = "";
  $scope.email = "";
  $scope.favorite = "recw";
  $scope.newUser = function() {
    $http.post('/srv/new', {
      name: $scope.name,
      email: $scope.email,
      favorite: $scope.favorite
    }).success(function(data) {
      localStorage.setItem("userid", data);
      $location.path('/map');
    })
  }

})

.controller('MapCtrl', function($scope, $state, $cordovaGeolocation, $http, $location) {
  var options = {timeout: 10000, enableHighAccuracy: true};

 $cordovaGeolocation.getCurrentPosition(options).then(function(position){
    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    var mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

    google.maps.event.addListenerOnce($scope.map, 'idle', function(){

      var marker = new google.maps.Marker({
        map: $scope.map,
        animation: google.maps.Animation.DROP,
        position: latLng
      });

    });

  }, function(error){
    console.log("Could not get initial location");
  });

  var routeArray = [];

  function trackingLoop()
  {
    $cordovaGeolocation.getCurrentPosition(options).then(
      function(position)
      {
        var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
        google.maps.event.addListenerOnce($scope.map, 'idle', function(){

          var marker = new google.maps.Marker({
            map: $scope.map,
            animation: google.maps.Animation.DROP,
            position: latLng
          });

        });
        console.log(position.coords.latitude.toString() + " " + position.coords.longitude.toString());

        routeArray.push({latitude:position.coords.latitude, longitude:position.coords.longitude, comment:""});
        console.log(routeArray);

      },
      function(error)
      {
        console.log("Could not get location");
      }
    )
  }

  //Start button
  document.getElementById("routeButton").onclick=function() {toggleRoute()};
  var trackingInterval;
  function toggleRoute()
  {
    if (document.getElementById("routeButton").innerHTML == "Start Route")
    {
      console.log("Starting interval");
      document.getElementById("routeButton").innerHTML = "Stop Route";
      trackingInterval = setInterval( function() { trackingLoop() }, 3000);
      $http.post('/srv/new', {
     name: "steve",
     email: "steve@example.com",
     favorite: "run"
   }).success(function(data) {
     localStorage.setItem("userid", data);
   })
    }
    else
    {
      console.log("Stopping interval");
      document.getElementById("routeButton").innerHTML = "Start Route";
      clearInterval(trackingInterval);

      var toSend={
       userid: localStorage.getItem("userid"),
       location: routeArray
      };
      $http.post('/srv/route', toSend).success(function(data){
       console.log("Success");
       $location.path('/newUser');
      }).error(function(err){
       console.log("Error "+ err);
      });

      routeArray = [];
    }
  }

})

;
