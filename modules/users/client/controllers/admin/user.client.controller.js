'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve', 'Notifications', 'AdminGuestsCount', '$http', '$location',
  function ($scope, $state, Authentication, userResolve, Notifications, AdminGuestsCount, $http, $location) {
    $scope.authentication = Authentication;
    $scope.user = userResolve;
    $scope.chapters = [];
    $scope.usersChapter= { id : null };


    $scope.isSuperAdmin = function(roles) {
      return roles.indexOf('superadmin') !== -1;
    };

    $scope.isAdmin = function(roles) {
      return roles.indexOf('admin') !== -1;
    };

    // populate dropdown
    $scope.getChapters = function (response){
      for (var i = 0; i < response.length; i ++){
        if (response[i].title === $scope.user.affiliation){
          $scope.usersChapter = { id : i };
        }
        $scope.chapters.push({ id : i, name: response[i].title });
      }
    };

    // initialize view
    $scope.init = function (){
      $http.get('api/chapters').success(function (response) {

        if (!response.length){
          $location.path('/server-error');
        } else {
          // wrap in .then() for odd issue with failing promises
          $scope.user.$promise.then(function (res){
            $scope.user.affiliation = res.affiliation;
            $scope.getChapters(response);
          });
        }
      }).error(function (response) {
        // If error on chapter fetch, do not allow signup until resolved
        $location.path('/server-error');
      });
    };
    $scope.init();


    $scope.remove = function (user) {
      if (confirm('Are you sure you want to delete this user?')) {
        if (user) {
          user.$remove();
          $scope.users.splice($scope.users.indexOf(user), 1);
        } else {
          $scope.user.$remove(function () {
            $state.go('admin.users');
          });
        }
      }
    };

    $scope.update = function (isValid) {
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

      var user = $scope.user;

      // Can't be a guest and something else at the same time
      if(user.roles.indexOf('guest') > -1 && user.roles.length>1){
        $scope.error = 'A user cannot be a guest and something else at the same time.';
      }
      else{

        user.$update(function (response) {

          // if we are updating the currently logged on user..
          if (response.username === $scope.authentication.user.username){
            Authentication.user = response;
          }
          Notifications.update();
          $state.go('admin.user', { userId: user._id });

        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      }
    };
  }
]);
