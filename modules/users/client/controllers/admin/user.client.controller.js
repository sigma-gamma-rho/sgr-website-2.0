'use strict';

angular.module('users.admin').controller('UserController', ['$scope', '$state', 'Authentication', 'userResolve',
  function ($scope, $state, Authentication, userResolve) {
    $scope.authentication = Authentication;
    $scope.user = userResolve;

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
