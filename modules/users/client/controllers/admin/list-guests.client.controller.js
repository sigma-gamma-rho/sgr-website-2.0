'use strict';

angular.module('users.admin').controller('UserGuestController', ['$scope', '$filter', 'AdminGuests', '$state', 'Admin', 'Notifications',
  function ($scope, $filter, AdminGuests, $state, Admin, Notifications) {
    AdminGuests.query(function (data) {
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

    // Approve the guests request to join
    $scope.approve = function (user) {
      if (confirm('Are you sure you want to approve this user?')){
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
        };
      };
    };

    // Deny the guests request to join
    $scope.deny = function (user) {
      if (confirm('Are you sure you want to delete this user?')){
        if (user) {
          Admin.remove({ userId : user._id }, function (data) {
            $scope.users.splice($scope.users.indexOf(user), 1);
            $scope.buildPager();
            Notifications.update();
          });
        }
      }
    };

    $scope.info = function (user) {
      $state.go('admin.user', { 'userId': user._id });
    };
  }
]);
