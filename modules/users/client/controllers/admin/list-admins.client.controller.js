'use strict';

angular.module('users.admin').controller('UserAdminController', ['$scope', '$filter', 'AdminAdmins', 'Admin', '$state', 'Notifications', 'Authentication', 'Users', '$location', '$window',
  function ($scope, $filter, AdminAdmins, Admin, $state, Notifications, Authentication, Users, $location, $window) {
    $scope.authentication = Authentication;

    $scope.isSuperAdmin = function(roles) {
      return roles.indexOf('superadmin') !== -1;
    };

    AdminAdmins.query(function (data) {
      $scope.users = data;
      $scope.buildPager();
    });

    $scope.buildPager = function () {
      $scope.pagedItems = [];
      $scope.itemsPerPage = 15;
      $scope.currentPage = 1;
      $scope.figureOutItemsToDisplay();
    };

    $scope.figureOutItemsToDisplay = function () {
      $scope.filteredItems = $filter('filter')($scope.users, {
        $: $scope.search
      });
      $scope.filterLength = $scope.filteredItems.length;
      var begin = (($scope.currentPage - 1) * $scope.itemsPerPage);
      var end = begin + $scope.itemsPerPage;
      $scope.pagedItems = $scope.filteredItems.slice(begin, end);
    };

    $scope.pageChanged = function () {
      $scope.figureOutItemsToDisplay();
    };

    // Promote the user to an admin
    $scope.promote = function (user) {
      if (confirm('Are you sure you want to promote this account to "superadmin" privileges"?')){
        if (user) {
          $scope.promoteNewSuperAdmin(user);
          $scope.demoteCurrentSuperAdmin();
        }
      }
    };

    $scope.promoteNewSuperAdmin = function (user) {
      $scope.entry = Admin.get({ userId: user._id }, function() {

        // change the guests role to user
        $scope.entry.roles.push('superadmin');
        // update the guest, rebuild the page, update the # of notificaitons
        $scope.entry.$update(function(res) {
          console.log(res);
        });
      });
    };

    $scope.demoteCurrentSuperAdmin = function () {

      var oldAdmin = Admin.get({ userId: Authentication.user._id }, function() {

        var index = oldAdmin.roles.indexOf('superadmin');
        if (index > -1) {
          oldAdmin.roles.splice(index, 1);
        }
        oldAdmin.$update(function(res) {
          console.log(res);
          location.reload();
          $location.path('/');
        });
      });
    };


    // Deny the guests request to join
    $scope.demote = function (user) {
      if (confirm('Are you sure you want to demote this account to "user" privileges?')){
        if (user) {
          $scope.entry = Admin.get({ userId: user._id }, function() {

            // change the guests role to user
            $scope.entry.roles = ['user'];

            // update the guest, rebuild the page, update the # of notificaitons
            $scope.entry.$update(function() {
              $scope.users.splice($scope.users.indexOf(user), 1);
              $scope.buildPager();
              Notifications.update();
            });
          });
        }
      }
    };

    $scope.info = function (userId) {
      $state.go('admin.user', { userId: userId });
    };
  }
]);
