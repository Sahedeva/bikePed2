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
  });

  $urlRouterProvider.otherwise("/newUser");

})

.controller('MapCtrl', function($scope, $state, $cordovaGeolocation, $http, $location, ApiEndpoint) {
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

      var infoWindow = new google.maps.InfoWindow({
        content: "Here I am!"
      });

      google.maps.event.addListener(marker, 'click', function () {
        infoWindow.open($scope.map, marker);
      });

    });

  }, function(error){
    console.log("Could not get initial location");
  });

  var routeArray = [];
  var counter = 0;
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

          var infoWindow = new google.maps.InfoWindow({
            content: "Here I am! Marker #"+counter
          });



          google.maps.event.addListener(marker, 'click', function () {
            infoWindow.open($scope.map, marker);
          });


        });


        console.log(position.coords.latitude.toString() + " " + position.coords.longitude.toString());
        routeArray.push({latitude:position.coords.latitude, longitude:position.coords.longitude, comment:""});
        console.log(routeArray);
        if (routeArray.length>1){
          var pos1 = {lat:routeArray[counter-1]['latitude'], lng:routeArray[counter-1]['longitude']};
          var pos2 = {lat:routeArray[counter]['latitude'], lng:routeArray[counter]['longitude']};;
          var linePath = new google.maps.Polyline({
            path: [
              pos1,
              pos2
            ],
            'strokeColor' : '#AA00FF',
            'strokeOpacity' : 1.0,
            'strokeWeight': 2,
            'geodesic': false
          });
          linePath.setMap($scope.map);
        }
        counter++
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
      trackingInterval = setInterval( function() { trackingLoop() }, 10000);
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
      $http.post(ApiEndpoint.url+'/route', toSend).success(function(data){
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
