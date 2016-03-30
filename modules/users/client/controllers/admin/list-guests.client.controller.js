'use strict';

angular.module('users.admin').controller('UserGuestController', ['$scope', '$filter', 'AdminGuests', '$state',
  function ($scope, $filter, AdminGuests, $state) {
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

    $scope.approve = function () {
      console.log('approving!');
    };

    $scope.deny = function () {
      console.log('denied');
    };

    $scope.info = function (userId) {
      $state.go('admin.user', {userId: userId});
    };

  }
]);
