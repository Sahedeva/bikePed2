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
  });

  $urlRouterProvider.otherwise("/newUser");

})

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

.controller('MapCtrl', function($scope, $state, $cordovaGeolocation, $http, $location, ApiEndpoint) {
  var options = {timeout: 10000, enableHighAccuracy: true};


  //Content Form Button
  var commentForm = document.createElement("form");
  commentForm.id = "commentForm";
  var commentFormInput = document.createElement("input");
  commentFormInput.id = "commentInput";
  commentFormInput.type = "text";
  commentFormInput.placeholder = "Add Comment";
  var commentFormButton = document.createElement("input");
  commentFormButton.id = "commentButton";
  commentFormButton.type = "submit";
  commentFormButton.value = "Submit";
  var commentFormCounter = document.createElement("input");
  commentFormCounter.id = "commentCounter";
  commentFormCounter.type = "hidden";

  var commentStringArray =[];
  var counter = 0;
  var commentString="";

  commentFormButton.onclick=function() {setComment()};
  function setComment()
  {
    commentString = commentFormInput.value;
    commentStringArray[commentFormCounter.value] = commentString;
    commentFormInput.value = "";
  }

  commentForm.appendChild(commentFormInput);
  commentForm.appendChild(commentFormButton);
  commentForm.appendChild(commentFormCounter);




  $cordovaGeolocation.getCurrentPosition(options).then(function(position){
    var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    var mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);


      var marker = new google.maps.Marker({
        map: $scope.map,
        animation: google.maps.Animation.DROP,
        position: latLng
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


          var marker = new google.maps.Marker({
            map: $scope.map,
            animation: google.maps.Animation.DROP,
            position: latLng
          });

          var infoWindow = new google.maps.InfoWindow({
            content: commentForm
          });

          google.maps.event.addListener(marker, 'click', function () {
            infoWindow.open($scope.map, marker);
          });



        commentFormCounter.value = counter;
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
  var routeLength = counter+1;
  function toggleRoute()
  {
    if (document.getElementById("routeButton").innerHTML == "Start Route")
    {
      console.log("Starting interval");
      document.getElementById("routeButton").innerHTML = "Stop Route";
      trackingInterval = setInterval( function() { trackingLoop() }, 3000);
    }
    else if (document.getElementById("routeButton").innerHTML == "Stop Route")
    {
      console.log("Stopping interval");
      document.getElementById("routeButton").innerHTML = "Update Route";
      clearInterval(trackingInterval);
    }
    else if (document.getElementById("routeButton").innerHTML == "Update Route")
    {
      for (let i=0; i<routeArray.length; i++)
        routeArray[i]['comment'] = commentStringArray[i];

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

    }

  }

})

;
