angular.module('starter-controllers', ['ionic', 'ngCordova'])

.controller('UserCtrl', function($scope, $state, $http, $location, ApiEndpoint) {
  $scope.name = "";
  $scope.email = "";
  $scope.favorite = "recw";
  $scope.newUser = function() {
    $http.post(ApiEndpoint.url + '/new', {
      name: $scope.name,
      email: $scope.email,
      favorite: $scope.favorite
    }).success(function(data) {
      localStorage.setItem("userid", data);
      $location.path('/map');
    })
  }
})

.controller('RouteCtrl', function($scope, $state, $cordovaGeolocation, $http, $location, ApiEndpoint) {

  // functions that should be in a services object:
  var _getAllRoutes = function() {
    $scope.routes = null;
    $http.get(ApiEndpoint.url + '/routes', function(data) {
      $scope.routes = data;
    });
  };
  var _getRoute = function(routeId) {
    $scope.route = null;
    $http.get(ApiEndpoint.url + '/route/'+routeId, function(data) {
      $scope.route = data;
    });
  };
  var _getRoutesForUser = function(userId) {
    $scope.routes = null;
    $http.get(ApiEndpoint.url + '/routes/'+userId, function(data) {
      $scope.routes = data;
    });
  };

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

});
