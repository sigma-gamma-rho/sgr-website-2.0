'use strict';

angular.module('users.admin').controller('UserListController', ['$scope', '$filter', 'Admin', '$state', 'Notifications',
  function ($scope, $filter, Admin, $state, Notifications) {
    Admin.query(function (data) {
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
      if (confirm('Are you sure you want to promote this account to "admin" privileges"?')){
        if (user) {
          $scope.entry = Admin.get({ userId: user._id }, function() {

            // change the guests role to user
            $scope.entry.roles = ['admin'];

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

    // Deny the guests request to join
    $scope.demote = function (user) {
      if (confirm('Are you sure you want to demote this account to "guest" privileges?')){
        if (user) {
          $scope.entry = Admin.get({ userId: user._id }, function() {

            // change the guests role to user
            $scope.entry.roles = ['guest'];

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
