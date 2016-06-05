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
    $http.get(ApiEndpoint.url + '/routes').success(function(data) {
      $scope.routes = data;
    });
  };
  var _getRoute = function(routeId, next) {
    $scope.route = null;
    $http.get(ApiEndpoint.url + '/route/'+routeId).success(function(data) {
      $scope.route = data;
      next(data.location);
    });
  };
  var _getRoutesForUser = function(userId) {
    $scope.routes = null;
    $http.get(ApiEndpoint.url + '/routes/'+userId).success(function(data) {
      $scope.routes = data;
    });
  };

  var _plotRoute = function(routeData) {
    var polyLinePath = [];
    for(var i=0; i<routeData.length; ++i) {
      var elem = routeData[i];
      polyLinePath.push({
        lat: elem.latitude,
        lng: elem.longitude
      });
    }
    var polyLine = new google.maps.Polyline({
      path: polyLinePath,
      geodesic: true,
      strokeColor: '#FF0000',
      strokeOpacity: 1.0,
      strokeWeight: 2
    });
    polyLine.setMap($scope.map);
    _plotRouteMarkers(routeData);
  }

  var _plotRouteMarkers = function(routeData) {
    for (var i=0; i<routeData.length; ++i) {
      var elem = routeData[i];
      if (elem.comment != null && elem.comment !== '') {
        var loc = new google.maps.LatLng(elem.latitude, elem.longitude);
        var marker = new google.maps.Marker({
          map: $scope.map,
          animation: google.maps.Animation.DROP,
          position: loc,
          title: elem.comment
        });
      }
    }
  }

  // Controller methods.
  $scope.showRoute = function(routeId) {
    console.log('Attempting to show route '+routeId);
    _getRoute(routeId, _plotRoute);
  }

  var options = {timeout: 10000, enableHighAccuracy: true};

  $cordovaGeolocation.getCurrentPosition(options).then(function(position){
    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    var mapOptions = {
      center: latLng,
      zoom: 16,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);

  }, function(error){
    console.log("Could not get initial location");
  });

});
