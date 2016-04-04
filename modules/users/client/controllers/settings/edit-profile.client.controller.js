'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication',
  function ($scope, $http, $location, Users, Authentication) {
    $scope.user = Authentication.user;

    // On load, get the list of chapters for which to populate the dropdown
    $scope.data = { availableOptions: [] };
    $http.get('api/chapters').success(function (response) {
      // If no chapters exist, then do not allow signup until resolved
      if (!response.length){
        $location.path('/server-error');
      }
      // Populate the data array
      else {
        for (var i = 0; i < response.length; i ++){
          $scope.data.availableOptions.push(response[i].title);
        }
      }
    }).error(function (response) {
      // If error on chapter fetch, do not allow signup until resolved
      $location.path('/server-error');

    });


    // Update a user profile
    $scope.updateUserProfile = function (isValid) {
      $scope.success = $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');

        return false;
      }

      var user = new Users($scope.user);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm');

        $scope.success = true;
        Authentication.user = response;
      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]);
