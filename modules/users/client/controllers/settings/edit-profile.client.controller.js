'use strict';

angular.module('users').controller('EditProfileController', ['$scope', '$http', '$location', 'Users', 'Authentication', '$interval',
  function ($scope, $http, $location, Users, Authentication, $interval) {

    $scope.user = Authentication.user;
    if (!user.firstName || !user.lastName || !user.email || !user.affiliation || !user.username){
      $scope.missing = true;
    }

    // On load, get the list of chapters for which to populate the dropdown
    $scope.chapters = [];
    $scope.usersChapter= { id : null };

    $http.get('api/chapters').success(function (response) {
      // If no chapters exist, then do not allow signup until resolved
      if (!response.length){
        $location.path('/server-error');
      }
      // Populate the data array
      else {
        for (var i = 0; i < response.length; i ++){
          if (response[i].title === $scope.user.affiliation){
            $scope.usersChapter = { id : i };
          }
          $scope.chapters.push({ id : i, name: response[i].title });
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

      // must update the affiliation by checking as ng-model is not user.affiliation
      for (var i = 0; i < $scope.chapters.length ; i++){
        if ($scope.chapters[i].id === $scope.usersChapter.id){
          $scope.user.affiliation = $scope.chapters[i].name;
        }
      }

      var user = new Users($scope.user);

      user.$update(function (response) {
        $scope.$broadcast('show-errors-reset', 'userForm');

        $scope.success = true;
        Authentication.user = response;
        if ($scope.missing){
          $scope.missing = false;
        }

      }, function (response) {
        $scope.error = response.data.message;
      });
    };
  }
]);
