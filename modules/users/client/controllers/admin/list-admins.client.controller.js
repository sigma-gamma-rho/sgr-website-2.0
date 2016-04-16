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

    $scope.info = function (userId) {
      $state.go('admin.user', { userId: userId });
    };

    // ------------------------------------------------------------------
    // Modal Stuff
    $scope.setModalInformation = function (title, body, user, method){
      $scope.modalHeader = title;
      $scope.modalBody = body;
      $scope.user = user;
      $scope.modalMethod = method;
    };

    $scope.promote = function () {
      $scope.promoteNewSuperAdmin();
      $scope.demoteCurrentSuperAdmin();
    };

    $scope.promoteNewSuperAdmin = function () {
      $scope.entry = Admin.get({ userId: $scope.user._id }, function() {
        $scope.entry.roles.push('superadmin');
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
          // Redirect to home page
          $window.location.href = '/';
        });
      });
    };

    // Deny the guests request to join
    $scope.demote = function () {
      $scope.entry = Admin.get({ userId: $scope.user._id }, function() {

        // change the guests role to user
        $scope.entry.roles = ['user'];

        // update the guest, rebuild the page, update the # of notificaitons
        $scope.entry.$update(function() {
          $scope.users.splice($scope.users.indexOf($scope.user), 1);
          $scope.buildPager();
          Notifications.update();
        });
      });
    };

  }
]);
