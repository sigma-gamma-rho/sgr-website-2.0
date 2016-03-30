'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$state', '$http', '$location', '$window', 'Authentication', 'PasswordValidator', 'Menus', 'AdminGuestsCount', 'Notifications',
  function ($scope, $state, $http, $location, $window, Authentication, PasswordValidator, Menus, AdminGuestsCount, Notifications) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();

    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    $scope.signup = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signup', $scope.credentials).success(function (response) {
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;

        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).error(function (response) {
        if (response.processing){
          $state.go('authentication.processing');
        }else{
          $scope.error = response.message;
        }
        //$scope.error = response.message;
      });
    };

    // Get the number of guests
    $scope.getCount = function(){
      AdminGuestsCount.get(function (data) {
        Notifications.count = data.count;
      }, function(error){
        console.log(error);
      });
    };

    $scope.signin = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      $http.post('/api/auth/signin', $scope.credentials).success(function (response) {
        console.log('Successful signin. Redirecting to ' + $state.previous.state.name || 'home');
        // If successful we assign the response to the global user model
        $scope.authentication.user = response;


        // Get the topbar menu
        $scope.menu = Menus.getMenu('topbar');

        // Iterate through the menu items
        // If the admin item is a menu item
        // And we have permissions to see it
        // Get the number of guest requests
        for (var i = 0; i < $scope.menu.items.length; i ++){
          var obj = $scope.menu.items[i];
          for (var prop in obj){
            if (obj.hasOwnProperty(prop) && obj[prop] === 'Admin') {
              if (obj.shouldRender(Authentication.user)){
                $scope.getCount();
              }
            }
          }
        }


        // And redirect to the previous or home page
        $state.go($state.previous.state.name || 'home', $state.previous.params);


      }).error(function (response) {
        if (response.processing){
          $state.go('authentication.processing');
        }else{
          $scope.error = response.message;
        }
        //$scope.error = response.message;
      });
    };

    // OAuth provider request
    $scope.callOauthProvider = function (url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    };
  }
]);
