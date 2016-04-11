'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve', 'Notifications', 'AdminGuestsCount', '$http', '$location',
  function ($scope, $state, Authentication, userResolve, Notifications, AdminGuestsCount, $http, $location) {
    $scope.authentication = Authentication;
    $scope.user = userResolve;


    // On load, get the list of chapters for which to populate the dropdown
    $scope.chapters = [];
    // must give an id to set default for ng-options select menu
    $scope.usersChapter= { id : null };
    $http.get('api/chapters').success(function (response) {

      if (!response.length){
        $location.path('/server-error');
      } else {

          // wrap in .then() for odd issue with failing promises
          $scope.user.$promise.then(function (res){

            $scope.user.affiliation = res.affiliation;

            for (var i = 0; i < response.length; i ++){
              if (response[i].title === $scope.user.affiliation){
                $scope.usersChapter = { id : i };
              }
              $scope.chapters.push({ id : i, name: response[i].title });
            }
          });
      }
    }).error(function (response) {
      // If error on chapter fetch, do not allow signup until resolved
      $location.path('/server-error');
    });


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

      var user = $scope.user;

      // Can't be a guest and something else at the same time
      if(user.roles.indexOf('guest') > -1 && user.roles.length>1){
        $scope.error = 'A user cannot be a guest and something else at the same time.';
      }
      else{

        user.$update(function () {
          AdminGuestsCount.get(function (data) {
            Notifications.countChange(data.count);
          }, function(error){
            console.log(error);
          });

          $state.go('admin.user', {
            userId: user._id
          });
        }, function (errorResponse) {
          $scope.error = errorResponse.data.message;
        });
      }
    };
  }
]);
